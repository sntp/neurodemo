module.exports = {
	random: (min, max) => min + Math.random() * (max - min),

    formatNumber: n => {
        let round = n => {
            if (Math.abs(n) % 1 == 0) {
                return n
            } 
            return n.toFixed(2).replace(/\.?0+$/g, '')
        }
        if (n < 0) {
            return `(${round(n)})`
        }
        return round(n)
    }
}