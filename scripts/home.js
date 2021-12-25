/*
    GLOBAL VARIABLES
-------------------*/
const packageList = document.querySelector(".package-list");
var commandsTxt = document.querySelector(".commands-txt");
var spanSuccess = document.querySelector('.sub-heading');
const resetBtn = document.querySelector('.reset-btn');
const form = document.querySelector(".package-form");
const copyBtn = document.querySelector(".copy-btn");
let jsonPath = "./data/packages.json";

/*
    EVENT LISTENERS
----------------------*/
document.addEventListener("DOMpackageLoaded", fetchJson(jsonPath));
resetBtn.addEventListener('click', resetForm);
copyBtn.addEventListener("click", updateClipboard);
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

    commandsTxt.select();
    document.execCommand('copy');

    let checkboxItem = document.querySelector('input[name="package-item"]:checked');

    if (checkboxItem) {
        spanSuccess.innerText = "Copied to the clipboard! ✅";
        spanSuccess.style.visiblity = 'initial';

    } else {
        //document.querySelector('.status').innerText = null;
        spanSuccess.innerText = "Please select any packages! ❎";
        spanSuccess.style.visiblity = 'initial';
    }



}

// generate chocolatey install commands from checkbox input
function onPackageSelect(e) {
    e.preventDefault();
    let chxbox = document.querySelectorAll("input[type=checkbox][name=package-item]");


    chxbox.forEach(() => {
        let checkedValue =
            Array.from(chxbox)
            .filter(i => i.checked)
            .map(i => i.value);

        commandsTxt.value = `choco install -y ${checkedValue.join(" ")}`;
        spanSuccess.style.visiblity = 'hidden';


    });

}

// load packages data from a json file
async function fetchJson() {
    let response = await fetch(jsonPath);
    let jsonData = await response.json();
    return jsonData;
}

// write a list from jsonData
function addListToHtml(ul) {
    fetchJson().then(function(jsonData) {
        for (i in jsonData) {
            // LOCAL VARIABLES
            let li = document.createElement("li");
            let label = document.createElement("label");
            let input = document.createElement("input");
            let img = document.createElement("img");
            let span = document.createElement("span");

            // SET ATTRIBUTES
            label.htmlFor = jsonData[i].pkgName; // <label for={jsonData.pkgName}>
            span.className = "package-list__label-text"
            label.className = "package-list__label";
            label.title = jsonData[i].description;

            input.type = "checkbox";
            input.name = "package-item";
            input.className = "label__checkbox";
            input.value = jsonData[i].pkgName;
            input.id = jsonData[i].pkgName;
            img.src = jsonData[i].icoUrl;
            img.className = "icoImg";
            span.innerHTML = `<b>${jsonData[i].name}</b> - ${jsonData[i].description}`;


            li.className = "package-list__item";

            // WRITE ELEMENTS
            li.appendChild(label); // <div><label> <=

            label.appendChild(input); // <div><label><input> <=
            label.appendChild(img);
            label.appendChild(span); // write jsonData.name after checkbox
            ul.appendChild(li); // li --> label --> input, img

        }
    })
}

// call function 
addListToHtml(packageList);