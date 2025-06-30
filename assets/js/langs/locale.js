import rus from "./rus.js"
import eng from "./eng.js"

const langs = {
    'rus': rus,
    'eng': eng
}

export function tr(string, ...args) {
    function fallback() {
        return "@" + string
    }

    try {
        const lang = window.cfg['ui.lang']
        const lang_arr = langs[lang] ?? []
        let output = lang_arr[string]

        if(!output) {
            return fallback()
        }

        if(args.length > 0) {
            if(typeof args[0] === "number") {
                const cardinal = args[0]
                let numberedString;

                switch(cardinal) {
                    case 0: 
                        numberedString = string + "_zero"
                        break
                    case 1: 
                        numberedString = string + "_one"
                        break
                    default:
                        if(cardinal < 20) {
                            numberedString = string + (cardinal < 5 ? "_few" : "_other")
                        } else {
                            switch(cardinal % 10) {
                                default:
                                case 0:
                                    numberedString = string + "_other"
                                    break
                                case 1:
                                    numberedString = string + "_one"
                                    break
                                case 2:
                                case 3:
                                case 4:
                                    numberedString = string + "_few"
                                    break
                            }
                        }
                }

                let newOutput = lang_arr[numberedString];
                if(newOutput == null) {
                    newOutput = lang_arr[string + "_other"] ?? string
                }

                output = newOutput;
            }
        }

        if(output == null) {
            return fallback()
        }

        for(const [ i, element ] of Object.entries(args)) {
            output = output.replace(RegExp("(\\$" + (Number(i) + 1) + ")"), element)
        }

        return output
    } catch(e) {
        return fallback()
    }
}

export default tr
