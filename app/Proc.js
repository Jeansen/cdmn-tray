'use strict'
let _singleton = null
const CPUS = new Map()
const fs_ = require('fs')

class Proc {

    constructor() {
        if (!_singleton) {
            _singleton = this
        } else
            return _singleton
    }

    static cpu() {

        let diff_usage = 0
        let results = new Map()

        let data = fs_.readFileSync('/proc/stat', 'utf8')

        let regx = new RegExp(/^cpu[0-9].*/, 'gm')
        let a = data.match(regx)

        for (let i of a) {
            let cpus = i.split(/\s+/)
            let cpu = cpus.shift()
            cpus = cpus.map(Number)

            if (!CPUS.has(cpu)) {
                CPUS.set(cpu, {
                    'prev_idle': 0,
                    'prev_total': 0,
                    'diff_total': 0
                })
            }

            let idle = cpus[3]
            let total = cpus.reduce((pv, cv) => pv + cv)

            let diff_idle = idle - CPUS.get(cpu)['prev_idle']
            if (total !== CPUS.get(cpu)['prev_total']) {
                CPUS.get(cpu)['diff_total'] = total - CPUS.get(cpu)['prev_total']
            }
            diff_usage = 100 * (CPUS.get(cpu)['diff_total'] - diff_idle) / CPUS.get(cpu)['diff_total']

            CPUS.get(cpu)['prev_idle'] = idle
            CPUS.get(cpu)['prev_total'] = total

            results.set(cpu, diff_usage)
        }
        return results
    }
}

module.exports = Proc