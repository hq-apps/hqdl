const pkgsRecievedEvent = new Event("pkgsRecieved");

let pkgs;

function getPromiseFromEvent(item, event) {
    return new Promise((resolve) => {
        const listener = () => {
            item.removeEventListener(event, listener);
            resolve(true);
        }
        item.addEventListener(event, listener);
    })
}

async function getpkg() {
    window.AppInventor.setWebViewString("request::getPackages") //|| setpkgresult()

    await getPromiseFromEvent(document, "pkgsRecieved")

    return pkgs
}
function setpkgresult(res) {
    //const result = JSON.parse((window.AppInventor?.getWebViewString() || `a::a::[{"package name": "abc"}]`).split("::")[2]).map(i => i["package name"])
    if (res.startsWith("result::getPackages::")) {
        document.getElementById("pain").innerHTML = ""
        const result = JSON.parse(res.split("::")[2]).map(i => { return { pkgName: i["package name"], name: i["app name"], versionName: i["version name"], versionCode: i["version code"] } })
        pkgs = result
        document.dispatchEvent(pkgsRecievedEvent);
    } else {
        document.getElementById("pain").innerHTML = "Loading... " + res
    }
}
//const result = JSON.parse(res.split("::")[2]).map(i => i["app name"])

async function getOnlinePkgs() {
    const res = await fetch("https://dl.hqapps.org/updates.json")
    const json = await res.json()
    let result = [];

    for (const id in json.byAndroidPkgName) {
        const hqid = json.byAndroidPkgName[id]
        result.push({
            androidPkgName: id,
            hqid: hqid,
            name: json.channels[hqid].name,
            icon: json.channels[hqid].icon,
            latest: json.channels[hqid].latest,
            latestURL: json.channels[hqid].latestURL
        })
    }
    return result
}

async function filterpkgs(pkgs) {
    const online = await getOnlinePkgs()
    const onlinePkgs = online.map(i => i.androidPkgName)
    console.log(onlinePkgs)

    return pkgs.map(i => onlinePkgs.includes(i.pkgName) && online[onlinePkgs.indexOf(i.pkgName)].latest != i.versionName ? online[onlinePkgs.indexOf(i.pkgName)] : null).filter(i => i)
}
async function test() {
    console.log(await filterpkgs([{ pkgName: "appinventor.ai_saffariteam.Browser", versionName: "1.2" }, { pkgName: "a.ai_saffariteam.Browser", versionName: "1.2" }]))
}
test()