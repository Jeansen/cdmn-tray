const Proc_ = require('./Proc')
const ipcRenderer_ = require('electron').ipcRenderer
const CANVAS = document.createElement('canvas')
const EventEmitter_ = require('events')
const TICK = new EventEmitter_()
const CTX = CANVAS.getContext('2d')

const map = new Map()


CANVAS.style.backgroundColor = 'rgba(0, 167, 0, 0.3)'
CANVAS.width = 60
CANVAS.height = 60
CTX.strokeStyle = 'white'
CTX.lineWidth = 3
CTX.fillStyle = 'green'
// let path1 = new Path2D("M0 0 h max v max h -max Z");
// ctx.fillStyle = "red"

let data = []
document.getElementById('x').appendChild(CANVAS)
manageEvents()

function drawGraph(p) {
    let max = CANVAS.width
    let g = p.get('cpu0')
    CTX.clearRect(0,0,CANVAS.width, CANVAS.height)
    CTX.moveTo(max,max)
    CTX.beginPath()

    let step = max / (g.length-1)
    let i=0
    for (let v of g) {
        data[i]=max - v / 100 * max
        i+=step
    }

    data.forEach(function(v, k) {
        CTX.lineTo(k,v)
    })

    CTX.lineTo(i, max)
    CTX.lineTo(0, max)
    CTX.closePath()
    CTX.fill()

    let init = false
    CTX.moveTo(max,max)
    data.forEach(function(v, k) {
        if (!init) {
            init=true
            CTX.moveTo(k,v)
        }
        CTX.lineTo(k,v)
    })
    CTX.stroke()
    ipcRenderer_.send('update-tray', CANVAS.toDataURL('image/jpeg'))
}

function draw() {
    let max = CANVAS.width
    // let g = Proc_.cpu()
    let g = arguments[0]
    CTX.clearRect(0,0,CANVAS.width, CANVAS.height)
    CTX.moveTo(max,max)
    CTX.beginPath()

    let step = max / (g.size-1)
    let i=0
    for (let [k,v] of g) {
        data[i]=max - v / 100 * max
        i+=step
    }

    data.forEach(function(v, k) {
        CTX.lineTo(k,v)
    })

    CTX.lineTo(i, max)
    CTX.lineTo(0, max)
    CTX.closePath()
    CTX.fill()

    let init = false
    CTX.moveTo(max,max)
    data.forEach(function(v, k) {
        if (!init) {
            init=true
            CTX.moveTo(k,v)
        }
        CTX.lineTo(k,v)
    })
    CTX.stroke()
    ipcRenderer_.send('update-tray', CANVAS.toDataURL('image/jpeg'))
}

function update(values) {
    for (let [k,v] of values){
        if(!map.has(k)){
            map.set(k, Array(16))
        }
        map.get(k).shift()
        map.get(k).push(v)
    }
    TICK.emit('draw', map, 200)
}

function manageEvents() {
    TICK.on('update', (data) => update(data))
    TICK.on('draw', (data) => drawGraph(data))
    setInterval(() => TICK.emit('update', Proc_.cpu()), 200)
}