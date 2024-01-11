import path from "path"
import fs from "fs"

import { homeassistant_supervised_path } from "./const.js"

const adaptions = new Map([
    [
        "/DEBIAN/postinst",
        (c) => {
            return replaceAll(
                c
                    .replace(
                        `DOCKER_REPO="ghcr.io/home-assistant"`,
                        `DOCKER_REPO="ghcr.nju.edu.cn/herberthe0229"`
                    )
                    .replace(
                        `URL_CHECK_ONLINE="checkonline.home-assistant.io"`,
                        `URL_CHECK_ONLINE="version.ha.ibert.me"`
                    ),
                "https://version.home-assistant.io/",
                "https://version.ha.ibert.me/"
            )
        },
    ],
    [
        "/etc/NetworkManager/NetworkManager.conf",
        (c) => {
            return c.replace(
                "http://checkonline.home-assistant.io/",
                "https://version.ha.ibert.me/"
            )
        },
    ],
    [
        "/usr/sbin/hassio-supervisor",
        (c) => {
            return replaceAll(
                c,
                `https://version.home-assistant.io/`,
                `https://version.ha.ibert.me/`
            )
        },
    ],
])

/**
 * 替换函数
 * @param {string} c
 * @param {string} f
 * @param {string} t
 * @returns {string}
 */
const replaceAll = (c, f, t) => {
    let tmp = c
    while (tmp.includes(f)) {
        tmp = tmp.replace(f, t)
    }

    return tmp
}

export const adapter = () => {
    for (const [p, fn] of adaptions) {
        const pa = path.join(
            homeassistant_supervised_path,
            ...p.split("/").slice(1)
        )
        if (!fs.existsSync(pa)) {
            throw new Error(`文件 ${pa} 不存在！`)
        }

        const content = fs.readFileSync(pa, "utf-8")

        fs.writeFileSync(pa, fn.call(null, content))
    }
}
