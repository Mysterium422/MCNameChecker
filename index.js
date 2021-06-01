// namemc scrapper package
const { lookupName } = require('namemc')

// Convert UNIX to human readable
async function timeConverter (UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes()
    var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds()
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

async function main (input) {
    // Fetch API Result
    let result = await lookupName(input).catch((err) => {
        if (err.toString().includes('Username is not in use.')) {
            console.log("Account Available")
            return "error"
        }
        console.log("API bugged. Stacktrace below")
        console.log(err)
        return "error"
    })
    if (result == "error") return
    for (let i = 0; i < result.length; i++) {
        // If someone has this name currently, name unavailable
        if(result[i].currentName.toLowerCase() == input.toLowerCase()) {
            console.log(`Account Unavailable (${result[i].uuid})`)
            return
        }

        // If someone recently changed from this name, this is when the name will be available
        if (result[i].pastNames[result[i].pastNames.length - 2].name.toLowerCase() == input.toLowerCase()) {
            if (result[i].pastNames[result[i].pastNames.length - 1].changedAt + 37 * 24 * 60 * 60 * 1000 > Date.now()) {
                console.log(`Account Available on ${await timeConverter(result[i].pastNames[result[i].pastNames.length - 1].changedAt + 37 * 24 * 60 * 60 * 1000)} (${result[i].uuid})`)
                return
            }
        }
    }
    console.log("Account Available")
}

process.stdin.on('data', (chunk) => {
    input = chunk.toString().replace("\n", "")
    main(input)
})