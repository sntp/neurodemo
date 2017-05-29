var _ = require('underscore'),
    XorNN = require('./xor-problem.js'),
    XorGraphController = require('./x-graph-controller.js'),
    config = require('./config.js')

module.exports = () => {
    var currentStep = 0,
        trainSet = [
            [[-1, -1, 1], -1],
            [[-1,  1, 1],  1],
            [[ 1, -1, 1],  1],
            [[ 1,  1, 1], -1]
        ]

    $(document).ready(() => {
        var xor = new XorNN(3, 4, 6, 0.5),
            xGraphController = new XorGraphController(xor, 'x-graph')

        $('#x-reset').click(() => {
            let inputCount = xor.inputCount,
                hiddenNeuronsCount = xor.hiddenNeuronsCount,
                lambda = xor.lambda,
                speed = xor.speed
            xor = new XorNN(inputCount, hiddenNeuronsCount, lambda, speed)
            xGraphController.xor = xor
            currentStep = 0
            update()
        })

        $('#x-step').click(() => {
            currentStep += 1
            let trainEntry = trainSet[(currentStep - 1) % trainSet.length]
            xor.train(trainEntry[0], trainEntry[1])
            update()
        })

        $('#x-run').click(() => {
            for (let i = 0; i < config.iterations; i++) {
                currentStep += 1
                let trainEntry = trainSet[(currentStep - 1) % trainSet.length]
                xor.train(trainEntry[0], trainEntry[1])
                if (evaluate()) {
                    update()
                    return
                }
            }
            update()
            $('#x-error-message').text(`Нейронная сеть не была обучена за ${config.iterations} итераций. Попробуйте изменить параметры и повторить попытку.`)
            $('#x-error-message').show()
        })

        $('#x-neurons').change(() => {
            xor.resize($('#x-neurons').val())
            update()
        })

        $('#x-lambda').change(() => {
            xor.lambda = parseFloat($('#x-lambda').val())
            update()
        })

        $('#x-speed').change(() => {
            xor.speed = parseFloat($('#x-speed').val())
            update()
        })

        $('.x-answer').change((e) => {
            let i = parseInt($(e.target).data('x-entry-id')),
                val = parseInt($(e.target).val())
            trainSet[i][1] = val
            update()
        })

        var determineOperation = () => {
            if (trainSet[0][1] == -1
                    && trainSet[1][1] == 1
                    && trainSet[2][1] == 1
                    && trainSet[3][1] == -1) {
                $('.x-operation').text('⊕')
            } else if (trainSet[0][1] == -1
                    && trainSet[1][1] == -1
                    && trainSet[2][1] == -1
                    && trainSet[3][1] == 1) {
                $('.x-operation').text('∧')
            } else if (trainSet[0][1] == -1
                    && trainSet[1][1] == 1
                    && trainSet[2][1] == 1
                    && trainSet[3][1] == 1) {
                $('.x-operation').text('∨')
            } else if (trainSet[0][1] == 1
                    && trainSet[1][1] == 1
                    && trainSet[2][1] == -1
                    && trainSet[3][1] == 1) {
                $('.x-operation').text('→')
            } else if (trainSet[0][1] == 1
                    && trainSet[1][1] == -1
                    && trainSet[2][1] == -1
                    && trainSet[3][1] == 1) {
                $('.x-operation').text('≡')
            } else {
                $('.x-operation').text('(op)')
            }
        }

        var evaluate = () => {
            return trainSet.map(entry => Math.abs(xor.calc(entry[0]) - entry[1]) < config.eps)
                           .every(x => x == true)
        }

        var update = () => {
            xGraphController.draw()
            determineOperation()

            $('#x-error-message').hide()
            $('#x-step-number').text(currentStep)

            if (currentStep != 0) {
                let trainEntry = trainSet[(currentStep - 1) % trainSet.length]
                $('.x-train-set-entry').removeClass('active')
                $('#x-entry-' + trainEntry[0][0] + trainEntry[0][1]).addClass('active')
            }

            $('#x-lambda').val(xor.lambda)
            $('#x-lambda-badge').text(xor.lambda.toFixed(2))

            $('#x-speed').val(xor.speed)
            $('#x-speed-badge').text(xor.speed.toFixed(2))

            $('#x-neurons').val(xor.hiddenNeuronsCount)
            $('#x-neurons-badge').text(xor.hiddenNeuronsCount)  

            let activationFunctionPoints = []
            for (let x = -1; x <= 1; x += 0.05) {
                let y = 2 / (1 + Math.exp(-xor.lambda * x)) - 1
                activationFunctionPoints.push([x, y])
            }
            $.plot('#x-activation-function',[activationFunctionPoints])
        }
        update()
    })
}