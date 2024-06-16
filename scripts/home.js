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
const iconSrc = "https://chocolatey.org/assets/images/nupkg/";


/*
    EVENT LISTENERS
----------------------*/
document.addEventListener("DOMContentLoaded", () => fetchYaml(yamlPath));
resetBtn.addEventListener('click', resetForm);
copyBtn.addEventListener("click", updateClipboard);
allBtn.addEventListener("click", selectAllPkg);
form.addEventListener('change', onPackageSelect);

/*
    FUNCTIONS
-----------------*/
// reset form & clear status message
function resetForm(e) {
    e.preventDefault();
    form.reset(); //reset form
    // reset status message 
    spanSuccess.style.visiblity = 'hidden';

    spanSuccess.innerText = "Generate chocolatey commands from the apps you've picked    ";

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
        spanSuccess.style.visiblity = 'initial';

    } else {
        //document.querySelector('.status').innerText = null;
        spanSuccess.innerText = "Please select any packages! ❎";
        spanSuccess.style.visiblity = 'initial';
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
    let checkedValue = null;

    chxbox.forEach(() => {
        checkedValue =
            Array.from(chxbox)
            .filter(i => i.checked)
            .map(i => i.value);

        spanSuccess.style.visiblity = 'hidden';

        if (chxbox[0].checked) {
            commandsTxt.value = installCmd;
            if (checkedValue.length > 1) {
                checkedValue.shift();
                commandsTxt.value = installCmd + `choco install -y ${checkedValue.join(" ")}`;
            }
        } else {
            commandsTxt.value = `choco install -y ${checkedValue.join(" ")}`;
        }

    });



}


// load packages data from a YAML file
async function fetchYaml() {
    let response = await fetch(yamlPath);
    let yamlData = await response.text();
    yamlData = jsyaml.load(yamlData); // use jsyaml.load() instead of yaml.safeLoad()
    yamlData = yamlData.files["packages_list.yaml"].content;
    yamlData = jsyaml.load(yamlData);
    return yamlData;
  }
  



// write a list from yamlData
function addListToHtml(ul) {
    fetchYaml().then(function(yamlData) {
        for (i in yamlData) {
            // LOCAL VARIABLES
            let label = document.createElement("label");
            let input = document.createElement("input");
            let span = document.createElement("span");
            let img = document.createElement("img");
            let li = document.createElement("li");

            // SET ATTRIBUTES
            label.htmlFor = i // <label for={yamlData.pkgName}>
            span.className = "package-list__label-text"
            label.className = "package-list__label";
            label.title = yamlData[i].description;

            input.type = "checkbox";
            input.name = "package-item";
            input.className = "label__checkbox";
            input.value = i
            input.id = i
            img.src = iconSrc + yamlData[i].icoUrl;
            img.className = "icoImg";
            span.innerHTML = `<b>${yamlData[i].name}</b> - ${yamlData[i].description}`;


            li.className = "package-list__item";

            // WRITE ELEMENTS
            label.appendChild(input); // <div><label><input> <=
            label.appendChild(img);
            label.appendChild(span); // write yamlData.name after checkbox
            li.appendChild(label); // <div><label> <=
            ul.appendChild(li); // li --> label --> input, img

        }
    })
}

// call function 
addListToHtml(packageList);
