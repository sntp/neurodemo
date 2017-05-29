require('flot')
var _ = require('underscore'),
    config = require('./config.js')

class GraphConroller {
    constructor(xorNN, id) {
        this.xor = xorNN
        this.canvas = document.getElementById(id)
        this.ctx = this.canvas.getContext('2d')
    }

    draw() {
        let width = this.canvas.width,
            height = this.canvas.height,
            radius = 5,
            inputX = width / 10,
            marginTop = height / 10,
            inputHeight = height - marginTop * 2, 
            a = {x: inputX, y: marginTop + inputHeight * 0/2},
            b = {x: inputX, y: marginTop + inputHeight * 1/2},
            o = {x: inputX, y: marginTop + inputHeight * 2/2},
            inputs = [a, b, o],
            f = {x: width - inputX, y: height / 2},
            hiddenCount = this.xor.hiddenNeuronsCount,
            h = []

        for (let i = 0; i < hiddenCount; i++) {
            let offsetFactor = hiddenCount == 1
                ? 0.5
                : i / (hiddenCount - 1)
            h.push({x: width / 2, y: marginTop + inputHeight * offsetFactor})
        }

        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0, 0, width, height)

        this.ctx.strokeStyle = "grey"
        this.ctx.fillStyle = "black"
        this.ctx.font = "12px Arial"

        /* Points */
        this.ctx.beginPath()
        this.ctx.arc(a.x, a.y, radius, 0, 2 * Math.PI)
        this.ctx.fillText("a", a.x - radius - 12, a.y + radius / 2)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.arc(b.x, b.y, radius, 0, 2 * Math.PI)
        this.ctx.fillText("b", b.x - radius - 12, b.y + radius / 2)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.arc(o.x, o.y, radius, 0, 2 * Math.PI)
        this.ctx.fillText("1", o.x - radius - 12, o.y + radius / 2)
        this.ctx.stroke()

        h.forEach((point, i) => {
            this.ctx.beginPath()
            this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
            this.ctx.fillText("h" + (i + 1), point.x + 1.2 * radius, point.y - 1.2 * radius)
            this.ctx.stroke()
        })

        this.ctx.beginPath()
        this.ctx.arc(f.x, f.y, radius, 0, 2 * Math.PI)
        this.ctx.fillText("o", f.x - radius, f.y - 2 * radius)
        this.ctx.stroke()

        /* Lines */
        this.ctx.beginPath()
        inputs.forEach(input => {
            h.forEach(hidden => {
                this.ctx.moveTo(input.x + radius, input.y)
                this.ctx.lineTo(hidden.x - radius, hidden.y)
            })
        })
        h.forEach(hidden => {
            this.ctx.moveTo(hidden.x + radius, hidden.y)
            this.ctx.lineTo(f.x - radius, f.y)
        })  
        this.ctx.stroke()

        /* Weights */
        let inputLabels = ['a', 'b', '1'],
            hiddenWeightsHtml = this.xor.hiddenNeurons.map((n, i) =>
                n.map((w, j) => 
                    `<i>W<sub>${inputLabels[j]}h${i + 1}</sub> = ${w.toFixed(2)}</i>`
                ).join('</br>')
            ).join('</br>'),
            outputWeightsHtml = this.xor.outputWeights.map((w, i) => 
                `<i>W<sub>h${i + 1}o</sub> = ${w.toFixed(2)}</i>`
            ).join('</br>')

        $('#x-hidden-weights').html(hiddenWeightsHtml)
        $('#x-output-weights').html(outputWeightsHtml)
        
        /* Results */
        let x00 = this.xor.calc([-1, -1, 1]),
            x01 = this.xor.calc([-1, 1, 1]),
            x10 = this.xor.calc([1, -1, 1]),
            x11 = this.xor.calc([1, 1, 1]),
            e00 = parseInt($('#x-set-00').val()),
            e01 = parseInt($('#x-set-01').val()),
            e10 = parseInt($('#x-set-10').val()),
            e11 = parseInt($('#x-set-11').val())

        $('#x-res-00').text(x00.toFixed(2))
        $('#x-res-01').text(x01.toFixed(2))
        $('#x-res-10').text(x10.toFixed(2))
        $('#x-res-11').text(x11.toFixed(2))

        if (Math.abs(x00 - e00) < config.eps) {
            $('#x-res-00').parent().removeClass("danger")
        } else {
            $('#x-res-00').parent().addClass("danger")
        }

        if (Math.abs(x01 - e01) < config.eps) {
            $('#x-res-01').parent().removeClass("danger")
        } else {
            $('#x-res-01').parent().addClass("danger")
        }

        if (Math.abs(x10 - e10) < config.eps) {
            $('#x-res-10').parent().removeClass("danger")
        } else {
            $('#x-res-10').parent().addClass("danger")
        }

        if (Math.abs(x11 - e11) < config.eps) {
            $('#x-res-11').parent().removeClass("danger")
        } else {
            $('#x-res-11').parent().addClass("danger")
        }

        /* Adjustment */
        let outputAdjustments = this.xor.trainLog.outputAdjustments || [],
            hiddenAdjustments = this.xor.trainLog.hiddenAdjustments || []
        $('#x-input').html(this.xor.trainLog.input || '')
        $('#x-actual').html(this.xor.trainLog.actual || '')
        $('#x-expected').html(this.xor.trainLog.expected || '')
        $('#x-error').html(this.xor.trainLog.error || '')
        $('#x-output-adjustments').html(outputAdjustments.join('</br>'))
        $('#x-hidden-adjustments').html(hiddenAdjustments.join('</br>'))

    }
}


module.exports = GraphConroller