/*
    GLOBAL VARIABLES
-------------------*/
const packageListElement = document.querySelector(".package-list");
const commandInputElement = document.querySelector(".command-input");
const statusMessageElement = document.querySelector('.sub-heading');
const resetButtonElement = document.querySelector('.reset-button');
const copyButtonElement = document.querySelector(".copy-button");
const selectAllButtonElement = document.querySelector(".select-all-button");
const packageFormElement = document.querySelector(".package-form");
const yamlFilePath = "https://api.github.com/gists/f79a94082c09c3d68007d498a68a7f11";
const chocolateyInstallCommand =  `Set-ExecutionPolicy Bypass -Scope Process -Force; 
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; 
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')); `;
const iconSourcePath = "images/packageimages/";

let yamlData = null;

/*
    EVENT LISTENERS
----------------------*/
document.addEventListener("DOMContentLoaded", () => {
    fetchYamlData(yamlFilePath).then(data => {
        yamlData = data;
        populatePackageList(packageListElement);
    });

    resetButtonElement.addEventListener('click', resetForm);
    copyButtonElement.addEventListener("click", copyToClipboard);
    selectAllButtonElement.addEventListener("click", selectAllPackages);
    packageFormElement.addEventListener('change', onPackageSelectionChange);
});

/*
    FUNCTIONS
-----------------*/
// reset form & clear status message
function resetForm(e) {
    e.preventDefault();
    packageFormElement.reset(); //reset form
    statusMessageElement.style.visibility = 'initial';
    statusMessageElement.innerText = "Generate chocolatey commands from the apps you've picked";
    commandInputElement.value = null;
}

// copy command from textbox to the clipboard
function copyToClipboard(e) {
    e.preventDefault();

    let selectedPackage = document.querySelector('input[name="package-item"]:checked');

    if (selectedPackage) {
        commandInputElement.select();
        document.execCommand('copy');
        statusMessageElement.innerText = "Copied to the clipboard! ✅";
        statusMessageElement.style.visibility = 'initial';
    } else {
        statusMessageElement.innerText = "Please select any packages! ❎";
        statusMessageElement.style.visibility = 'initial';
    }
}

// select all item checkboxes
function selectAllPackages(e) {
    e.preventDefault();

    let checkboxes = document.querySelectorAll("input[type=checkbox][name=package-item]");
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.click();
        }
    });
}

// generate chocolatey install commands from checkbox input
function onPackageSelectionChange(e) {
    e.preventDefault();

    let checkboxes = document.querySelectorAll("input[type=checkbox][name=package-item]");
    let selectedPackages = Array.from(checkboxes)
                        .filter(checkbox => checkbox.checked)
                        .map(checkbox => checkbox.value);

    statusMessageElement.innerText = "Press 'Copy' button when you are ready.";
    statusMessageElement.style.visibility = 'initial';

    if (checkboxes[0].checked) {
        commandInputElement.value = chocolateyInstallCommand;
        if (selectedPackages.length > 1) {
            selectedPackages.shift();
            commandInputElement.value = chocolateyInstallCommand + `choco install -y ${selectedPackages.join(" ")}`;
        }
    } else {
        commandInputElement.value = `choco install -y ${selectedPackages.join(" ")}`;
    }
}

// load packages data from a YAML file
async function fetchYamlData(yamlFilePath) {
    let response = await fetch(yamlFilePath);
    let yamlText = await response.text();
    let gistData = jsyaml.load(yamlText); // use jsyaml.load() instead of yaml.safeLoad()
    let yamlContent = gistData.files["packages_list.yaml"].content;
    return jsyaml.load(yamlContent);
}

// write a list from yamlData
function populatePackageList(ulElement) {
    for (let packageName in yamlData) {
        let labelElement = document.createElement("label");
        let inputElement = document.createElement("input");
        let spanElement = document.createElement("span");
        let imgElement = document.createElement("img");
        let listItemElement = document.createElement("li");

        labelElement.htmlFor = packageName;
        spanElement.className = "package-list-label-text";
        labelElement.className = "package-list-label";
        labelElement.title = yamlData[packageName].description;

        inputElement.type = "checkbox";
        inputElement.name = "package-item";
        inputElement.className = "label-checkbox";
        inputElement.value = packageName;
        inputElement.id = packageName;
        imgElement.src = iconSourcePath + yamlData[packageName].icoUrl;
        imgElement.className = "icon-image";
        spanElement.innerHTML = `<b>${yamlData[packageName].name}</b> - ${yamlData[packageName].description}`;

        listItemElement.className = "package-list-item";

        labelElement.appendChild(inputElement);
        labelElement.appendChild(imgElement);
        labelElement.appendChild(spanElement);
        listItemElement.appendChild(labelElement);
        ulElement.appendChild(listItemElement);
    }
}
