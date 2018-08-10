// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var workspaceId = "";
var folderId = "";
var clientId = "";
var clientSecret = "";

function generateFileName(data) {
    var formResults = JSON.parse(data)
    var nameArr = formResults.CLOSERS_NAME.split(" ");
    var lastName = nameArr[nameArr.length-1];
    var fyntexNumber = formResults.FYNTEX_FILE_NUMBER;
    var timestamp = Date.now();
    var filename = `${lastName}_${fyntexNumber}_${timestamp}.json`;
    return filename;
}

var OneHubAPI = function(accessToken) {
    this.webmergeToOneHub = function(data) {
        var filename = generateFileName(data)
        var blob = new Blob([data], { type: 'application/json' });
        var formData = new FormData();
        formData.append("myfile", blob, filename);

        if (workspaceId === "" || folderId === "") {
            alert("Configure your workspace and folder ids in the Extension Options page.")
        } else {
            console.log("File sent to OneHub");
            var xhr = new XMLHttpRequest();
            var url = `https://ws-api.onehub.com/workspaces/${workspaceId}/folders/${folderId}/files`;
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 201) {
                    var notificationId = chrome.notifications.create(null, {
                        type: "basic",
                        iconUrl: "icon128.png",
                        title: "WebMerge => OneHub",
                        message: `${filename} sent to OneHub`
                    });
                    setTimeout(function () {
                        chrome.notifications.clear(notificationId);
                    }, 750);
                }
            };
            xhr.send(formData);
        }
    }
}

function updateConfig() {
    chrome.storage.sync.get({
        oneHubClientId: "",
        oneHubClientSecret: "",
        workspaceId: "",
        folderId: ""
    }, function(items) {
        clientId = items.oneHubClientId;
        clientSecret = items.oneHubClientSecret;
        workspaceId = items.workspaceId;
        folderId = items.folderId;
        if (clientId === "" || clientSecret === "" || workspaceId === "" || folderId === "") {
            alert("Configure your OneHub API Client in the Extension Options page.")
        }
    });
}

function authorize(data) {
    const redirectUrl = chrome.identity.getRedirectURL();
    if (clientId === "" || clientSecret === "") {
        alert("Configure your OneHub API Client in the Extension Options page.")
    } else {
        let authUrl = "https://ws-api.onehub.com/oauth/authorize" +
            `?client_id=${clientId}` +
            `&client_secret=${clientSecret}` +
            `&response_type=token` +
            `&redirect_uri=${encodeURIComponent(redirectUrl)}`;
        console.log(authUrl);

        chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, function (responseUrl) {
            var accessToken = responseUrl.substring(responseUrl.indexOf("=") + 1);
            var api = new OneHubAPI(accessToken);
            api.webmergeToOneHub(data);
        });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.event === "merge") {
        console.log(request.data);
        authorize(request.data);
    } else if (request.event === "load" || request.event === "optionsUpdate") {
        updateConfig();
    }
})