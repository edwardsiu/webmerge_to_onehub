var inputElems = document.getElementsByTagName("input");
var submitButton = inputElems[inputElems.length - 1];
chrome.runtime.sendMessage({ event: "load" });
submitButton.addEventListener("click", function() {
    data = parseWebMergeForm();
    chrome.runtime.sendMessage({event: "merge", data: data});
});

function parseWebMergeForm() {
    var formData = {}
    var fields = document.getElementsByClassName("field");
    var fieldLabel;
    var fieldValue;
    var i;
    for (i=0; i<fields.length; i++) {
        fieldLabel = fields[i].getElementsByClassName("label")[0].innerHTML.slice(0, -1);
        fieldValue = fields[i].getElementsByTagName("input")[0].value;
        formData[fieldLabel] = fieldValue;
    }
    return JSON.stringify(formData);
}