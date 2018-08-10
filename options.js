// Saves options to chrome.storage
function save_options() {
    var clientId = document.getElementById('client_id').value;
    var clientSecret = document.getElementById('client_secret').value;
    var workspaceId = document.getElementById('workspace_id').value;
    var folderId = document.getElementById('folder_id').value;
    chrome.storage.sync.set({
        oneHubClientId: clientId,
        oneHubClientSecret: clientSecret,
        workspaceId: workspaceId,
        folderId: folderId
    }, function () {
        // Let the extension know that options were updated
        // and that it should reauthorize itself with OneHub
        chrome.runtime.sendMessage({ event: "optionsUpdate" });
        
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Load the configuration saved in chrome storage into the options window
function restore_options() {
    chrome.storage.sync.get({
        oneHubClientId: "",
        oneHubClientSecret: "",
        workspaceId: "",
        folderId: ""
    }, function (items) {
        document.getElementById('client_id').value = items.oneHubClientId;
        document.getElementById('client_secret').value = items.oneHubClientSecret;
        document.getElementById('workspace_id').value = items.workspaceId;
        document.getElementById('folder_id').value = items.folderId;
        document.getElementById('redirect_uri').textContent = chrome.identity.getRedirectURL();
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);