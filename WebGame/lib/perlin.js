module.exports = {
    Simple1DNoise() {
        let MAX_VERTICES = 256;
        let MAX_VERTICES_MASK = MAX_VERTICES - 1;

        let r = [];

        for (let i = 0; i < MAX_VERTICES; ++i) {
            r.push(Math.random());
        }

        let getVal = (x) => {
            let xFloor = Math.floor(x);
            let t = x - xFloor;
            let tRemapSmoothstep = t * t * (3 - 2 * t);

            /// Modulo using &
            let xMin = xFloor & MAX_VERTICES_MASK;
            let xMax = (xMin + 1) & MAX_VERTICES_MASK;

            let y = lerp(r[xMin], r[xMax], tRemapSmoothstep);

            return y;
        };

        /**
         * Linear interpolation function.
         * @param a The lower integer value
         * @param b The upper integer value
         * @param t The value between the two
         * @returns {number}
         */
        let lerp = (a, b, t) => {
            return a * (1 - t) + b * t;
        };

        // return the API
        return {
            getVal: getVal
        };
    }
};