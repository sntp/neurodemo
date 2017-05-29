var _ = require('underscore'),
    util = require('./util.js'),
    config = require('./config.js')

class XorNN {
    constructor(inputCount, hiddenNeuronsCount, lambda, speed) {
        this.inputCount = inputCount
        this.hiddenNeuronsCount = hiddenNeuronsCount
        this.lambda = lambda
        this.speed = speed
        this.hiddenNeurons = []
        this.outputWeights = []
        this.trainLog = {}

        _(hiddenNeuronsCount).times(() => {
            let weghts = []
            _(inputCount).times(() => weghts.push(util.random(-5, 5)))
            this.hiddenNeurons.push(weghts)
            this.outputWeights.push(util.random(-5, 5))
        })
    }

    activate(input, weights) {
        let net = input.map((val, i) => val * weights[i])
                       .reduce((x, y) => x + y)
        return 2 / (1 + Math.exp(-this.lambda * net)) - 1
    }

    calc(input) {
        let hiddenOutputs = this.hiddenNeurons.map(n => this.activate(n, input))
        return this.activate(hiddenOutputs, this.outputWeights)
    } 

    train(input, expectedValue) {
        let f = util.formatNumber,
            hiddenOutputs = this.hiddenNeurons.map(n => this.activate(n, input)),
            xor = this.activate(hiddenOutputs, this.outputWeights),
            error = xor - expectedValue

        this.trainLog.input = input.join(', ')
        this.trainLog.expected = expectedValue
        this.trainLog.actual = xor.toFixed(2)
        this.trainLog.error = `${f(xor)} - ${f(expectedValue)} = ${error.toFixed(2)}`
        this.trainLog.hiddenAdjustments = []
        this.trainLog.outputAdjustments = []

        if (Math.abs(error) > config.eps) {
            // Adjust output weights
            for (let i = 0; i < this.outputWeights.length; i++) {
                let dw = this.speed * error * hiddenOutputs[i],
                    adjustmentLog = `W<sub>h${i + 1}o</sub> = ${f(this.outputWeights[i])} - ${this.speed} * ${f(error)} * ${f(hiddenOutputs[i])} = ${f(this.outputWeights[i] - dw)}`
                this.trainLog.outputAdjustments.push(adjustmentLog)
                this.outputWeights[i] -= dw
            }

            // Adjust hidden weights
            let inputLabels = ['a', 'b', '1']
            for (let i = 0; i < this.hiddenNeuronsCount; i++) {
                for (let j = 0; j < this.inputCount; j++) {
                    let dw = this.speed * error * (1 - Math.pow(hiddenOutputs[i], 2)) * this.outputWeights[i] * input[j],
                        adjustmentLog = `W<sub>${inputLabels[j]}h${i + 1}</sub> = ${f(this.hiddenNeurons[i][j])} - ${f(this.speed)} * ${f(error)} * (1 - ${f(hiddenOutputs[i])}<sup>2</sup>) * ${f(this.outputWeights[i])} * ${f(input[j])} = ${f(this.hiddenNeurons[i][j] - dw)}`
                    this.trainLog.hiddenAdjustments.push(adjustmentLog)
                    this.hiddenNeurons[i][j] -= dw
                }
            }
        }
    }

    resize(neurons) {
        let curNeurons = this.hiddenNeuronsCount
        console.log(curNeurons, neurons)
        if (neurons > curNeurons) {
            _(neurons - curNeurons).times(() => {
                let weights = []
                _(this.inputCount).times(() => weights.push(util.random(-5, 5)))
                this.hiddenNeurons.push(weights)
                this.outputWeights.push(util.random(-5, 5))
            })
        } else {
            this.hiddenNeurons = this.hiddenNeurons.slice(0, neurons)
            this.outputWeights = this.outputWeights.slice(0, neurons)
        }
        this.hiddenNeuronsCount = neurons
    }
}

module.exports = XorNN
