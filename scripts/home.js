/*
    GLOBAL VARIABLES
-------------------*/
const packageList = document.querySelector(".package-list");
const commandsTxt = document.querySelector(".commands-txt");
const spanSuccess = document.querySelector('.sub-heading');
const resetBtn = document.querySelector('.reset-btn');
const copyBtn = document.querySelector(".copy-btn");
const allBtn = document.querySelector(".all-btn");
const form = document.querySelector(".package-form");
const yamlPath = "https://api.github.com/gists/f79a94082c09c3d68007d498a68a7f11";
const installCmd =  `Set-ExecutionPolicy Bypass -Scope Process -Force; 
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; 
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')); `;
const iconSrc = "images/packageimages/";

let yamlData = null;

/*
    EVENT LISTENERS
----------------------*/
document.addEventListener("DOMContentLoaded", () => {
    fetchYaml(yamlPath).then(data => {
        yamlData = data;
        addListToHtml(packageList);
    });

    resetBtn.addEventListener('click', resetForm);
    copyBtn.addEventListener("click", updateClipboard);
    allBtn.addEventListener("click", selectAllPkg);
    form.addEventListener('change', onPackageSelect);
});

/*
    FUNCTIONS
-----------------*/
// reset form & clear status message
function resetForm(e) {
    e.preventDefault();
    form.reset(); //reset form
    spanSuccess.style.visibility = 'initial';
    spanSuccess.innerText = "Generate chocolatey commands from the apps you've picked";
    commandsTxt.value = null;
}

// copy command from textbox to the clipboard
function updateClipboard(e) {
    e.preventDefault();

    let checkboxItem = document.querySelector('input[name="package-item"]:checked');

    if (checkboxItem) {
        commandsTxt.select();
        document.execCommand('copy');
        spanSuccess.innerText = "Copied to the clipboard! ✅";
        spanSuccess.style.visibility = 'initial';
    } else {
        spanSuccess.innerText = "Please select any packages! ❎";
        spanSuccess.style.visibility = 'initial';
    }
}

// select all item checkboxes
function selectAllPkg(e) {
    e.preventDefault();

    let chxbox = document.querySelectorAll("input[type=checkbox][name=package-item]");
    chxbox.forEach(node => {
        if (!node.checked) {
            node.click();
        }
    });
}

// generate chocolatey install commands from checkbox input
function onPackageSelect(e) {
    e.preventDefault();

    let chxbox = document.querySelectorAll("input[type=checkbox][name=package-item]");
    let checkedValue = Array.from(chxbox)
                        .filter(i => i.checked)
                        .map(i => i.value);

    spanSuccess.innerText = "Press 'Copy' button when you ready.";
    spanSuccess.style.visibility = 'initial';

    if (chxbox[0].checked) {
        commandsTxt.value = installCmd;
        if (checkedValue.length > 1) {
            checkedValue.shift();
            commandsTxt.value = installCmd + `choco install -y ${checkedValue.join(" ")}`;
        }
    } else {
        commandsTxt.value = `choco install -y ${checkedValue.join(" ")}`;
    }
}

// load packages data from a YAML file
async function fetchYaml(yamlPath) {
    let response = await fetch(yamlPath);
    let yamlText = await response.text();
    let gistData = jsyaml.load(yamlText); // use jsyaml.load() instead of yaml.safeLoad()
    let yamlContent = gistData.files["packages_list.yaml"].content;
    return jsyaml.load(yamlContent);
}

// write a list from yamlData
function addListToHtml(ul) {
    for (let i in yamlData) {
        let label = document.createElement("label");
        let input = document.createElement("input");
        let span = document.createElement("span");
        let img = document.createElement("img");
        let li = document.createElement("li");

        label.htmlFor = i;
        span.className = "package-list__label-text";
        label.className = "package-list__label";
        label.title = yamlData[i].description;

        input.type = "checkbox";
        input.name = "package-item";
        input.className = "label__checkbox";
        input.value = i;
        input.id = i;
        img.src = iconSrc + yamlData[i].icoUrl;
        img.className = "icoImg";
        span.innerHTML = `<b>${yamlData[i].name}</b> - ${yamlData[i].description}`;

        li.className = "package-list__item";

        label.appendChild(input);
        label.appendChild(img);
        label.appendChild(span);
        li.appendChild(label);
        ul.appendChild(li);
    }
}
