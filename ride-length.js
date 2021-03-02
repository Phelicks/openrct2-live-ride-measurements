(function () {
	'use strict';

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	var BigInteger = createCommonjsModule(function (module) {
	var bigInt = (function (undefined$1) {

	    var BASE = 1e7,
	        LOG_BASE = 7,
	        MAX_INT = 9007199254740992,
	        MAX_INT_ARR = smallToArray(MAX_INT),
	        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

	    var supportsNativeBigInt = typeof BigInt === "function";

	    function Integer(v, radix, alphabet, caseSensitive) {
	        if (typeof v === "undefined") return Integer[0];
	        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
	        return parseValue(v);
	    }

	    function BigInteger(value, sign) {
	        this.value = value;
	        this.sign = sign;
	        this.isSmall = false;
	    }
	    BigInteger.prototype = Object.create(Integer.prototype);

	    function SmallInteger(value) {
	        this.value = value;
	        this.sign = value < 0;
	        this.isSmall = true;
	    }
	    SmallInteger.prototype = Object.create(Integer.prototype);

	    function NativeBigInt(value) {
	        this.value = value;
	    }
	    NativeBigInt.prototype = Object.create(Integer.prototype);

	    function isPrecise(n) {
	        return -MAX_INT < n && n < MAX_INT;
	    }

	    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
	        if (n < 1e7)
	            return [n];
	        if (n < 1e14)
	            return [n % 1e7, Math.floor(n / 1e7)];
	        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
	    }

	    function arrayToSmall(arr) { // If BASE changes this function may need to change
	        trim(arr);
	        var length = arr.length;
	        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
	            switch (length) {
	                case 0: return 0;
	                case 1: return arr[0];
	                case 2: return arr[0] + arr[1] * BASE;
	                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
	            }
	        }
	        return arr;
	    }

	    function trim(v) {
	        var i = v.length;
	        while (v[--i] === 0);
	        v.length = i + 1;
	    }

	    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
	        var x = new Array(length);
	        var i = -1;
	        while (++i < length) {
	            x[i] = 0;
	        }
	        return x;
	    }

	    function truncate(n) {
	        if (n > 0) return Math.floor(n);
	        return Math.ceil(n);
	    }

	    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
	        var l_a = a.length,
	            l_b = b.length,
	            r = new Array(l_a),
	            carry = 0,
	            base = BASE,
	            sum, i;
	        for (i = 0; i < l_b; i++) {
	            sum = a[i] + b[i] + carry;
	            carry = sum >= base ? 1 : 0;
	            r[i] = sum - carry * base;
	        }
	        while (i < l_a) {
	            sum = a[i] + carry;
	            carry = sum === base ? 1 : 0;
	            r[i++] = sum - carry * base;
	        }
	        if (carry > 0) r.push(carry);
	        return r;
	    }

	    function addAny(a, b) {
	        if (a.length >= b.length) return add(a, b);
	        return add(b, a);
	    }

	    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
	        var l = a.length,
	            r = new Array(l),
	            base = BASE,
	            sum, i;
	        for (i = 0; i < l; i++) {
	            sum = a[i] - base + carry;
	            carry = Math.floor(sum / base);
	            r[i] = sum - carry * base;
	            carry += 1;
	        }
	        while (carry > 0) {
	            r[i++] = carry % base;
	            carry = Math.floor(carry / base);
	        }
	        return r;
	    }

	    BigInteger.prototype.add = function (v) {
	        var n = parseValue(v);
	        if (this.sign !== n.sign) {
	            return this.subtract(n.negate());
	        }
	        var a = this.value, b = n.value;
	        if (n.isSmall) {
	            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
	        }
	        return new BigInteger(addAny(a, b), this.sign);
	    };
	    BigInteger.prototype.plus = BigInteger.prototype.add;

	    SmallInteger.prototype.add = function (v) {
	        var n = parseValue(v);
	        var a = this.value;
	        if (a < 0 !== n.sign) {
	            return this.subtract(n.negate());
	        }
	        var b = n.value;
	        if (n.isSmall) {
	            if (isPrecise(a + b)) return new SmallInteger(a + b);
	            b = smallToArray(Math.abs(b));
	        }
	        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
	    };
	    SmallInteger.prototype.plus = SmallInteger.prototype.add;

	    NativeBigInt.prototype.add = function (v) {
	        return new NativeBigInt(this.value + parseValue(v).value);
	    };
	    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

	    function subtract(a, b) { // assumes a and b are arrays with a >= b
	        var a_l = a.length,
	            b_l = b.length,
	            r = new Array(a_l),
	            borrow = 0,
	            base = BASE,
	            i, difference;
	        for (i = 0; i < b_l; i++) {
	            difference = a[i] - borrow - b[i];
	            if (difference < 0) {
	                difference += base;
	                borrow = 1;
	            } else borrow = 0;
	            r[i] = difference;
	        }
	        for (i = b_l; i < a_l; i++) {
	            difference = a[i] - borrow;
	            if (difference < 0) difference += base;
	            else {
	                r[i++] = difference;
	                break;
	            }
	            r[i] = difference;
	        }
	        for (; i < a_l; i++) {
	            r[i] = a[i];
	        }
	        trim(r);
	        return r;
	    }

	    function subtractAny(a, b, sign) {
	        var value;
	        if (compareAbs(a, b) >= 0) {
	            value = subtract(a, b);
	        } else {
	            value = subtract(b, a);
	            sign = !sign;
	        }
	        value = arrayToSmall(value);
	        if (typeof value === "number") {
	            if (sign) value = -value;
	            return new SmallInteger(value);
	        }
	        return new BigInteger(value, sign);
	    }

	    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
	        var l = a.length,
	            r = new Array(l),
	            carry = -b,
	            base = BASE,
	            i, difference;
	        for (i = 0; i < l; i++) {
	            difference = a[i] + carry;
	            carry = Math.floor(difference / base);
	            difference %= base;
	            r[i] = difference < 0 ? difference + base : difference;
	        }
	        r = arrayToSmall(r);
	        if (typeof r === "number") {
	            if (sign) r = -r;
	            return new SmallInteger(r);
	        } return new BigInteger(r, sign);
	    }

	    BigInteger.prototype.subtract = function (v) {
	        var n = parseValue(v);
	        if (this.sign !== n.sign) {
	            return this.add(n.negate());
	        }
	        var a = this.value, b = n.value;
	        if (n.isSmall)
	            return subtractSmall(a, Math.abs(b), this.sign);
	        return subtractAny(a, b, this.sign);
	    };
	    BigInteger.prototype.minus = BigInteger.prototype.subtract;

	    SmallInteger.prototype.subtract = function (v) {
	        var n = parseValue(v);
	        var a = this.value;
	        if (a < 0 !== n.sign) {
	            return this.add(n.negate());
	        }
	        var b = n.value;
	        if (n.isSmall) {
	            return new SmallInteger(a - b);
	        }
	        return subtractSmall(b, Math.abs(a), a >= 0);
	    };
	    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

	    NativeBigInt.prototype.subtract = function (v) {
	        return new NativeBigInt(this.value - parseValue(v).value);
	    };
	    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

	    BigInteger.prototype.negate = function () {
	        return new BigInteger(this.value, !this.sign);
	    };
	    SmallInteger.prototype.negate = function () {
	        var sign = this.sign;
	        var small = new SmallInteger(-this.value);
	        small.sign = !sign;
	        return small;
	    };
	    NativeBigInt.prototype.negate = function () {
	        return new NativeBigInt(-this.value);
	    };

	    BigInteger.prototype.abs = function () {
	        return new BigInteger(this.value, false);
	    };
	    SmallInteger.prototype.abs = function () {
	        return new SmallInteger(Math.abs(this.value));
	    };
	    NativeBigInt.prototype.abs = function () {
	        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
	    };


	    function multiplyLong(a, b) {
	        var a_l = a.length,
	            b_l = b.length,
	            l = a_l + b_l,
	            r = createArray(l),
	            base = BASE,
	            product, carry, i, a_i, b_j;
	        for (i = 0; i < a_l; ++i) {
	            a_i = a[i];
	            for (var j = 0; j < b_l; ++j) {
	                b_j = b[j];
	                product = a_i * b_j + r[i + j];
	                carry = Math.floor(product / base);
	                r[i + j] = product - carry * base;
	                r[i + j + 1] += carry;
	            }
	        }
	        trim(r);
	        return r;
	    }

	    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
	        var l = a.length,
	            r = new Array(l),
	            base = BASE,
	            carry = 0,
	            product, i;
	        for (i = 0; i < l; i++) {
	            product = a[i] * b + carry;
	            carry = Math.floor(product / base);
	            r[i] = product - carry * base;
	        }
	        while (carry > 0) {
	            r[i++] = carry % base;
	            carry = Math.floor(carry / base);
	        }
	        return r;
	    }

	    function shiftLeft(x, n) {
	        var r = [];
	        while (n-- > 0) r.push(0);
	        return r.concat(x);
	    }

	    function multiplyKaratsuba(x, y) {
	        var n = Math.max(x.length, y.length);

	        if (n <= 30) return multiplyLong(x, y);
	        n = Math.ceil(n / 2);

	        var b = x.slice(n),
	            a = x.slice(0, n),
	            d = y.slice(n),
	            c = y.slice(0, n);

	        var ac = multiplyKaratsuba(a, c),
	            bd = multiplyKaratsuba(b, d),
	            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

	        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
	        trim(product);
	        return product;
	    }

	    // The following function is derived from a surface fit of a graph plotting the performance difference
	    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
	    function useKaratsuba(l1, l2) {
	        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
	    }

	    BigInteger.prototype.multiply = function (v) {
	        var n = parseValue(v),
	            a = this.value, b = n.value,
	            sign = this.sign !== n.sign,
	            abs;
	        if (n.isSmall) {
	            if (b === 0) return Integer[0];
	            if (b === 1) return this;
	            if (b === -1) return this.negate();
	            abs = Math.abs(b);
	            if (abs < BASE) {
	                return new BigInteger(multiplySmall(a, abs), sign);
	            }
	            b = smallToArray(abs);
	        }
	        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
	            return new BigInteger(multiplyKaratsuba(a, b), sign);
	        return new BigInteger(multiplyLong(a, b), sign);
	    };

	    BigInteger.prototype.times = BigInteger.prototype.multiply;

	    function multiplySmallAndArray(a, b, sign) { // a >= 0
	        if (a < BASE) {
	            return new BigInteger(multiplySmall(b, a), sign);
	        }
	        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
	    }
	    SmallInteger.prototype._multiplyBySmall = function (a) {
	        if (isPrecise(a.value * this.value)) {
	            return new SmallInteger(a.value * this.value);
	        }
	        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
	    };
	    BigInteger.prototype._multiplyBySmall = function (a) {
	        if (a.value === 0) return Integer[0];
	        if (a.value === 1) return this;
	        if (a.value === -1) return this.negate();
	        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
	    };
	    SmallInteger.prototype.multiply = function (v) {
	        return parseValue(v)._multiplyBySmall(this);
	    };
	    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

	    NativeBigInt.prototype.multiply = function (v) {
	        return new NativeBigInt(this.value * parseValue(v).value);
	    };
	    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

	    function square(a) {
	        //console.assert(2 * BASE * BASE < MAX_INT);
	        var l = a.length,
	            r = createArray(l + l),
	            base = BASE,
	            product, carry, i, a_i, a_j;
	        for (i = 0; i < l; i++) {
	            a_i = a[i];
	            carry = 0 - a_i * a_i;
	            for (var j = i; j < l; j++) {
	                a_j = a[j];
	                product = 2 * (a_i * a_j) + r[i + j] + carry;
	                carry = Math.floor(product / base);
	                r[i + j] = product - carry * base;
	            }
	            r[i + l] = carry;
	        }
	        trim(r);
	        return r;
	    }

	    BigInteger.prototype.square = function () {
	        return new BigInteger(square(this.value), false);
	    };

	    SmallInteger.prototype.square = function () {
	        var value = this.value * this.value;
	        if (isPrecise(value)) return new SmallInteger(value);
	        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
	    };

	    NativeBigInt.prototype.square = function (v) {
	        return new NativeBigInt(this.value * this.value);
	    };

	    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
	        var a_l = a.length,
	            b_l = b.length,
	            base = BASE,
	            result = createArray(b.length),
	            divisorMostSignificantDigit = b[b_l - 1],
	            // normalization
	            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
	            remainder = multiplySmall(a, lambda),
	            divisor = multiplySmall(b, lambda),
	            quotientDigit, shift, carry, borrow, i, l, q;
	        if (remainder.length <= a_l) remainder.push(0);
	        divisor.push(0);
	        divisorMostSignificantDigit = divisor[b_l - 1];
	        for (shift = a_l - b_l; shift >= 0; shift--) {
	            quotientDigit = base - 1;
	            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
	                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
	            }
	            // quotientDigit <= base - 1
	            carry = 0;
	            borrow = 0;
	            l = divisor.length;
	            for (i = 0; i < l; i++) {
	                carry += quotientDigit * divisor[i];
	                q = Math.floor(carry / base);
	                borrow += remainder[shift + i] - (carry - q * base);
	                carry = q;
	                if (borrow < 0) {
	                    remainder[shift + i] = borrow + base;
	                    borrow = -1;
	                } else {
	                    remainder[shift + i] = borrow;
	                    borrow = 0;
	                }
	            }
	            while (borrow !== 0) {
	                quotientDigit -= 1;
	                carry = 0;
	                for (i = 0; i < l; i++) {
	                    carry += remainder[shift + i] - base + divisor[i];
	                    if (carry < 0) {
	                        remainder[shift + i] = carry + base;
	                        carry = 0;
	                    } else {
	                        remainder[shift + i] = carry;
	                        carry = 1;
	                    }
	                }
	                borrow += carry;
	            }
	            result[shift] = quotientDigit;
	        }
	        // denormalization
	        remainder = divModSmall(remainder, lambda)[0];
	        return [arrayToSmall(result), arrayToSmall(remainder)];
	    }

	    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
	        // Performs faster than divMod1 on larger input sizes.
	        var a_l = a.length,
	            b_l = b.length,
	            result = [],
	            part = [],
	            base = BASE,
	            guess, xlen, highx, highy, check;
	        while (a_l) {
	            part.unshift(a[--a_l]);
	            trim(part);
	            if (compareAbs(part, b) < 0) {
	                result.push(0);
	                continue;
	            }
	            xlen = part.length;
	            highx = part[xlen - 1] * base + part[xlen - 2];
	            highy = b[b_l - 1] * base + b[b_l - 2];
	            if (xlen > b_l) {
	                highx = (highx + 1) * base;
	            }
	            guess = Math.ceil(highx / highy);
	            do {
	                check = multiplySmall(b, guess);
	                if (compareAbs(check, part) <= 0) break;
	                guess--;
	            } while (guess);
	            result.push(guess);
	            part = subtract(part, check);
	        }
	        result.reverse();
	        return [arrayToSmall(result), arrayToSmall(part)];
	    }

	    function divModSmall(value, lambda) {
	        var length = value.length,
	            quotient = createArray(length),
	            base = BASE,
	            i, q, remainder, divisor;
	        remainder = 0;
	        for (i = length - 1; i >= 0; --i) {
	            divisor = remainder * base + value[i];
	            q = truncate(divisor / lambda);
	            remainder = divisor - q * lambda;
	            quotient[i] = q | 0;
	        }
	        return [quotient, remainder | 0];
	    }

	    function divModAny(self, v) {
	        var value, n = parseValue(v);
	        if (supportsNativeBigInt) {
	            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
	        }
	        var a = self.value, b = n.value;
	        var quotient;
	        if (b === 0) throw new Error("Cannot divide by zero");
	        if (self.isSmall) {
	            if (n.isSmall) {
	                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
	            }
	            return [Integer[0], self];
	        }
	        if (n.isSmall) {
	            if (b === 1) return [self, Integer[0]];
	            if (b == -1) return [self.negate(), Integer[0]];
	            var abs = Math.abs(b);
	            if (abs < BASE) {
	                value = divModSmall(a, abs);
	                quotient = arrayToSmall(value[0]);
	                var remainder = value[1];
	                if (self.sign) remainder = -remainder;
	                if (typeof quotient === "number") {
	                    if (self.sign !== n.sign) quotient = -quotient;
	                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
	                }
	                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
	            }
	            b = smallToArray(abs);
	        }
	        var comparison = compareAbs(a, b);
	        if (comparison === -1) return [Integer[0], self];
	        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

	        // divMod1 is faster on smaller input sizes
	        if (a.length + b.length <= 200)
	            value = divMod1(a, b);
	        else value = divMod2(a, b);

	        quotient = value[0];
	        var qSign = self.sign !== n.sign,
	            mod = value[1],
	            mSign = self.sign;
	        if (typeof quotient === "number") {
	            if (qSign) quotient = -quotient;
	            quotient = new SmallInteger(quotient);
	        } else quotient = new BigInteger(quotient, qSign);
	        if (typeof mod === "number") {
	            if (mSign) mod = -mod;
	            mod = new SmallInteger(mod);
	        } else mod = new BigInteger(mod, mSign);
	        return [quotient, mod];
	    }

	    BigInteger.prototype.divmod = function (v) {
	        var result = divModAny(this, v);
	        return {
	            quotient: result[0],
	            remainder: result[1]
	        };
	    };
	    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


	    BigInteger.prototype.divide = function (v) {
	        return divModAny(this, v)[0];
	    };
	    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
	        return new NativeBigInt(this.value / parseValue(v).value);
	    };
	    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

	    BigInteger.prototype.mod = function (v) {
	        return divModAny(this, v)[1];
	    };
	    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
	        return new NativeBigInt(this.value % parseValue(v).value);
	    };
	    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

	    BigInteger.prototype.pow = function (v) {
	        var n = parseValue(v),
	            a = this.value,
	            b = n.value,
	            value, x, y;
	        if (b === 0) return Integer[1];
	        if (a === 0) return Integer[0];
	        if (a === 1) return Integer[1];
	        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
	        if (n.sign) {
	            return Integer[0];
	        }
	        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
	        if (this.isSmall) {
	            if (isPrecise(value = Math.pow(a, b)))
	                return new SmallInteger(truncate(value));
	        }
	        x = this;
	        y = Integer[1];
	        while (true) {
	            if (b & 1 === 1) {
	                y = y.times(x);
	                --b;
	            }
	            if (b === 0) break;
	            b /= 2;
	            x = x.square();
	        }
	        return y;
	    };
	    SmallInteger.prototype.pow = BigInteger.prototype.pow;

	    NativeBigInt.prototype.pow = function (v) {
	        var n = parseValue(v);
	        var a = this.value, b = n.value;
	        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
	        if (b === _0) return Integer[1];
	        if (a === _0) return Integer[0];
	        if (a === _1) return Integer[1];
	        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
	        if (n.isNegative()) return new NativeBigInt(_0);
	        var x = this;
	        var y = Integer[1];
	        while (true) {
	            if ((b & _1) === _1) {
	                y = y.times(x);
	                --b;
	            }
	            if (b === _0) break;
	            b /= _2;
	            x = x.square();
	        }
	        return y;
	    };

	    BigInteger.prototype.modPow = function (exp, mod) {
	        exp = parseValue(exp);
	        mod = parseValue(mod);
	        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
	        var r = Integer[1],
	            base = this.mod(mod);
	        if (exp.isNegative()) {
	            exp = exp.multiply(Integer[-1]);
	            base = base.modInv(mod);
	        }
	        while (exp.isPositive()) {
	            if (base.isZero()) return Integer[0];
	            if (exp.isOdd()) r = r.multiply(base).mod(mod);
	            exp = exp.divide(2);
	            base = base.square().mod(mod);
	        }
	        return r;
	    };
	    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

	    function compareAbs(a, b) {
	        if (a.length !== b.length) {
	            return a.length > b.length ? 1 : -1;
	        }
	        for (var i = a.length - 1; i >= 0; i--) {
	            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
	        }
	        return 0;
	    }

	    BigInteger.prototype.compareAbs = function (v) {
	        var n = parseValue(v),
	            a = this.value,
	            b = n.value;
	        if (n.isSmall) return 1;
	        return compareAbs(a, b);
	    };
	    SmallInteger.prototype.compareAbs = function (v) {
	        var n = parseValue(v),
	            a = Math.abs(this.value),
	            b = n.value;
	        if (n.isSmall) {
	            b = Math.abs(b);
	            return a === b ? 0 : a > b ? 1 : -1;
	        }
	        return -1;
	    };
	    NativeBigInt.prototype.compareAbs = function (v) {
	        var a = this.value;
	        var b = parseValue(v).value;
	        a = a >= 0 ? a : -a;
	        b = b >= 0 ? b : -b;
	        return a === b ? 0 : a > b ? 1 : -1;
	    };

	    BigInteger.prototype.compare = function (v) {
	        // See discussion about comparison with Infinity:
	        // https://github.com/peterolson/BigInteger.js/issues/61
	        if (v === Infinity) {
	            return -1;
	        }
	        if (v === -Infinity) {
	            return 1;
	        }

	        var n = parseValue(v),
	            a = this.value,
	            b = n.value;
	        if (this.sign !== n.sign) {
	            return n.sign ? 1 : -1;
	        }
	        if (n.isSmall) {
	            return this.sign ? -1 : 1;
	        }
	        return compareAbs(a, b) * (this.sign ? -1 : 1);
	    };
	    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

	    SmallInteger.prototype.compare = function (v) {
	        if (v === Infinity) {
	            return -1;
	        }
	        if (v === -Infinity) {
	            return 1;
	        }

	        var n = parseValue(v),
	            a = this.value,
	            b = n.value;
	        if (n.isSmall) {
	            return a == b ? 0 : a > b ? 1 : -1;
	        }
	        if (a < 0 !== n.sign) {
	            return a < 0 ? -1 : 1;
	        }
	        return a < 0 ? 1 : -1;
	    };
	    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

	    NativeBigInt.prototype.compare = function (v) {
	        if (v === Infinity) {
	            return -1;
	        }
	        if (v === -Infinity) {
	            return 1;
	        }
	        var a = this.value;
	        var b = parseValue(v).value;
	        return a === b ? 0 : a > b ? 1 : -1;
	    };
	    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

	    BigInteger.prototype.equals = function (v) {
	        return this.compare(v) === 0;
	    };
	    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

	    BigInteger.prototype.notEquals = function (v) {
	        return this.compare(v) !== 0;
	    };
	    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

	    BigInteger.prototype.greater = function (v) {
	        return this.compare(v) > 0;
	    };
	    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

	    BigInteger.prototype.lesser = function (v) {
	        return this.compare(v) < 0;
	    };
	    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

	    BigInteger.prototype.greaterOrEquals = function (v) {
	        return this.compare(v) >= 0;
	    };
	    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

	    BigInteger.prototype.lesserOrEquals = function (v) {
	        return this.compare(v) <= 0;
	    };
	    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

	    BigInteger.prototype.isEven = function () {
	        return (this.value[0] & 1) === 0;
	    };
	    SmallInteger.prototype.isEven = function () {
	        return (this.value & 1) === 0;
	    };
	    NativeBigInt.prototype.isEven = function () {
	        return (this.value & BigInt(1)) === BigInt(0);
	    };

	    BigInteger.prototype.isOdd = function () {
	        return (this.value[0] & 1) === 1;
	    };
	    SmallInteger.prototype.isOdd = function () {
	        return (this.value & 1) === 1;
	    };
	    NativeBigInt.prototype.isOdd = function () {
	        return (this.value & BigInt(1)) === BigInt(1);
	    };

	    BigInteger.prototype.isPositive = function () {
	        return !this.sign;
	    };
	    SmallInteger.prototype.isPositive = function () {
	        return this.value > 0;
	    };
	    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

	    BigInteger.prototype.isNegative = function () {
	        return this.sign;
	    };
	    SmallInteger.prototype.isNegative = function () {
	        return this.value < 0;
	    };
	    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

	    BigInteger.prototype.isUnit = function () {
	        return false;
	    };
	    SmallInteger.prototype.isUnit = function () {
	        return Math.abs(this.value) === 1;
	    };
	    NativeBigInt.prototype.isUnit = function () {
	        return this.abs().value === BigInt(1);
	    };

	    BigInteger.prototype.isZero = function () {
	        return false;
	    };
	    SmallInteger.prototype.isZero = function () {
	        return this.value === 0;
	    };
	    NativeBigInt.prototype.isZero = function () {
	        return this.value === BigInt(0);
	    };

	    BigInteger.prototype.isDivisibleBy = function (v) {
	        var n = parseValue(v);
	        if (n.isZero()) return false;
	        if (n.isUnit()) return true;
	        if (n.compareAbs(2) === 0) return this.isEven();
	        return this.mod(n).isZero();
	    };
	    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

	    function isBasicPrime(v) {
	        var n = v.abs();
	        if (n.isUnit()) return false;
	        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
	        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
	        if (n.lesser(49)) return true;
	        // we don't know if it's prime: let the other functions figure it out
	    }

	    function millerRabinTest(n, a) {
	        var nPrev = n.prev(),
	            b = nPrev,
	            r = 0,
	            d, i, x;
	        while (b.isEven()) b = b.divide(2), r++;
	        next: for (i = 0; i < a.length; i++) {
	            if (n.lesser(a[i])) continue;
	            x = bigInt(a[i]).modPow(b, n);
	            if (x.isUnit() || x.equals(nPrev)) continue;
	            for (d = r - 1; d != 0; d--) {
	                x = x.square().mod(n);
	                if (x.isUnit()) return false;
	                if (x.equals(nPrev)) continue next;
	            }
	            return false;
	        }
	        return true;
	    }

	    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
	    BigInteger.prototype.isPrime = function (strict) {
	        var isPrime = isBasicPrime(this);
	        if (isPrime !== undefined$1) return isPrime;
	        var n = this.abs();
	        var bits = n.bitLength();
	        if (bits <= 64)
	            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
	        var logN = Math.log(2) * bits.toJSNumber();
	        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
	        for (var a = [], i = 0; i < t; i++) {
	            a.push(bigInt(i + 2));
	        }
	        return millerRabinTest(n, a);
	    };
	    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

	    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
	        var isPrime = isBasicPrime(this);
	        if (isPrime !== undefined$1) return isPrime;
	        var n = this.abs();
	        var t = iterations === undefined$1 ? 5 : iterations;
	        for (var a = [], i = 0; i < t; i++) {
	            a.push(bigInt.randBetween(2, n.minus(2), rng));
	        }
	        return millerRabinTest(n, a);
	    };
	    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

	    BigInteger.prototype.modInv = function (n) {
	        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
	        while (!newR.isZero()) {
	            q = r.divide(newR);
	            lastT = t;
	            lastR = r;
	            t = newT;
	            r = newR;
	            newT = lastT.subtract(q.multiply(newT));
	            newR = lastR.subtract(q.multiply(newR));
	        }
	        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
	        if (t.compare(0) === -1) {
	            t = t.add(n);
	        }
	        if (this.isNegative()) {
	            return t.negate();
	        }
	        return t;
	    };

	    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

	    BigInteger.prototype.next = function () {
	        var value = this.value;
	        if (this.sign) {
	            return subtractSmall(value, 1, this.sign);
	        }
	        return new BigInteger(addSmall(value, 1), this.sign);
	    };
	    SmallInteger.prototype.next = function () {
	        var value = this.value;
	        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
	        return new BigInteger(MAX_INT_ARR, false);
	    };
	    NativeBigInt.prototype.next = function () {
	        return new NativeBigInt(this.value + BigInt(1));
	    };

	    BigInteger.prototype.prev = function () {
	        var value = this.value;
	        if (this.sign) {
	            return new BigInteger(addSmall(value, 1), true);
	        }
	        return subtractSmall(value, 1, this.sign);
	    };
	    SmallInteger.prototype.prev = function () {
	        var value = this.value;
	        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
	        return new BigInteger(MAX_INT_ARR, true);
	    };
	    NativeBigInt.prototype.prev = function () {
	        return new NativeBigInt(this.value - BigInt(1));
	    };

	    var powersOfTwo = [1];
	    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
	    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

	    function shift_isSmall(n) {
	        return Math.abs(n) <= BASE;
	    }

	    BigInteger.prototype.shiftLeft = function (v) {
	        var n = parseValue(v).toJSNumber();
	        if (!shift_isSmall(n)) {
	            throw new Error(String(n) + " is too large for shifting.");
	        }
	        if (n < 0) return this.shiftRight(-n);
	        var result = this;
	        if (result.isZero()) return result;
	        while (n >= powers2Length) {
	            result = result.multiply(highestPower2);
	            n -= powers2Length - 1;
	        }
	        return result.multiply(powersOfTwo[n]);
	    };
	    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

	    BigInteger.prototype.shiftRight = function (v) {
	        var remQuo;
	        var n = parseValue(v).toJSNumber();
	        if (!shift_isSmall(n)) {
	            throw new Error(String(n) + " is too large for shifting.");
	        }
	        if (n < 0) return this.shiftLeft(-n);
	        var result = this;
	        while (n >= powers2Length) {
	            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
	            remQuo = divModAny(result, highestPower2);
	            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
	            n -= powers2Length - 1;
	        }
	        remQuo = divModAny(result, powersOfTwo[n]);
	        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
	    };
	    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

	    function bitwise(x, y, fn) {
	        y = parseValue(y);
	        var xSign = x.isNegative(), ySign = y.isNegative();
	        var xRem = xSign ? x.not() : x,
	            yRem = ySign ? y.not() : y;
	        var xDigit = 0, yDigit = 0;
	        var xDivMod = null, yDivMod = null;
	        var result = [];
	        while (!xRem.isZero() || !yRem.isZero()) {
	            xDivMod = divModAny(xRem, highestPower2);
	            xDigit = xDivMod[1].toJSNumber();
	            if (xSign) {
	                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
	            }

	            yDivMod = divModAny(yRem, highestPower2);
	            yDigit = yDivMod[1].toJSNumber();
	            if (ySign) {
	                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
	            }

	            xRem = xDivMod[0];
	            yRem = yDivMod[0];
	            result.push(fn(xDigit, yDigit));
	        }
	        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
	        for (var i = result.length - 1; i >= 0; i -= 1) {
	            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
	        }
	        return sum;
	    }

	    BigInteger.prototype.not = function () {
	        return this.negate().prev();
	    };
	    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

	    BigInteger.prototype.and = function (n) {
	        return bitwise(this, n, function (a, b) { return a & b; });
	    };
	    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

	    BigInteger.prototype.or = function (n) {
	        return bitwise(this, n, function (a, b) { return a | b; });
	    };
	    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

	    BigInteger.prototype.xor = function (n) {
	        return bitwise(this, n, function (a, b) { return a ^ b; });
	    };
	    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

	    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
	    function roughLOB(n) { // get lowestOneBit (rough)
	        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
	        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
	        var v = n.value,
	            x = typeof v === "number" ? v | LOBMASK_I :
	                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
	                    v[0] + v[1] * BASE | LOBMASK_BI;
	        return x & -x;
	    }

	    function integerLogarithm(value, base) {
	        if (base.compareTo(value) <= 0) {
	            var tmp = integerLogarithm(value, base.square(base));
	            var p = tmp.p;
	            var e = tmp.e;
	            var t = p.multiply(base);
	            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
	        }
	        return { p: bigInt(1), e: 0 };
	    }

	    BigInteger.prototype.bitLength = function () {
	        var n = this;
	        if (n.compareTo(bigInt(0)) < 0) {
	            n = n.negate().subtract(bigInt(1));
	        }
	        if (n.compareTo(bigInt(0)) === 0) {
	            return bigInt(0);
	        }
	        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
	    };
	    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

	    function max(a, b) {
	        a = parseValue(a);
	        b = parseValue(b);
	        return a.greater(b) ? a : b;
	    }
	    function min(a, b) {
	        a = parseValue(a);
	        b = parseValue(b);
	        return a.lesser(b) ? a : b;
	    }
	    function gcd(a, b) {
	        a = parseValue(a).abs();
	        b = parseValue(b).abs();
	        if (a.equals(b)) return a;
	        if (a.isZero()) return b;
	        if (b.isZero()) return a;
	        var c = Integer[1], d, t;
	        while (a.isEven() && b.isEven()) {
	            d = min(roughLOB(a), roughLOB(b));
	            a = a.divide(d);
	            b = b.divide(d);
	            c = c.multiply(d);
	        }
	        while (a.isEven()) {
	            a = a.divide(roughLOB(a));
	        }
	        do {
	            while (b.isEven()) {
	                b = b.divide(roughLOB(b));
	            }
	            if (a.greater(b)) {
	                t = b; b = a; a = t;
	            }
	            b = b.subtract(a);
	        } while (!b.isZero());
	        return c.isUnit() ? a : a.multiply(c);
	    }
	    function lcm(a, b) {
	        a = parseValue(a).abs();
	        b = parseValue(b).abs();
	        return a.divide(gcd(a, b)).multiply(b);
	    }
	    function randBetween(a, b, rng) {
	        a = parseValue(a);
	        b = parseValue(b);
	        var usedRNG = rng || Math.random;
	        var low = min(a, b), high = max(a, b);
	        var range = high.subtract(low).add(1);
	        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
	        var digits = toBase(range, BASE).value;
	        var result = [], restricted = true;
	        for (var i = 0; i < digits.length; i++) {
	            var top = restricted ? digits[i] : BASE;
	            var digit = truncate(usedRNG() * top);
	            result.push(digit);
	            if (digit < top) restricted = false;
	        }
	        return low.add(Integer.fromArray(result, BASE, false));
	    }

	    var parseBase = function (text, base, alphabet, caseSensitive) {
	        alphabet = alphabet || DEFAULT_ALPHABET;
	        text = String(text);
	        if (!caseSensitive) {
	            text = text.toLowerCase();
	            alphabet = alphabet.toLowerCase();
	        }
	        var length = text.length;
	        var i;
	        var absBase = Math.abs(base);
	        var alphabetValues = {};
	        for (i = 0; i < alphabet.length; i++) {
	            alphabetValues[alphabet[i]] = i;
	        }
	        for (i = 0; i < length; i++) {
	            var c = text[i];
	            if (c === "-") continue;
	            if (c in alphabetValues) {
	                if (alphabetValues[c] >= absBase) {
	                    if (c === "1" && absBase === 1) continue;
	                    throw new Error(c + " is not a valid digit in base " + base + ".");
	                }
	            }
	        }
	        base = parseValue(base);
	        var digits = [];
	        var isNegative = text[0] === "-";
	        for (i = isNegative ? 1 : 0; i < text.length; i++) {
	            var c = text[i];
	            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
	            else if (c === "<") {
	                var start = i;
	                do { i++; } while (text[i] !== ">" && i < text.length);
	                digits.push(parseValue(text.slice(start + 1, i)));
	            }
	            else throw new Error(c + " is not a valid character");
	        }
	        return parseBaseFromArray(digits, base, isNegative);
	    };

	    function parseBaseFromArray(digits, base, isNegative) {
	        var val = Integer[0], pow = Integer[1], i;
	        for (i = digits.length - 1; i >= 0; i--) {
	            val = val.add(digits[i].times(pow));
	            pow = pow.times(base);
	        }
	        return isNegative ? val.negate() : val;
	    }

	    function stringify(digit, alphabet) {
	        alphabet = alphabet || DEFAULT_ALPHABET;
	        if (digit < alphabet.length) {
	            return alphabet[digit];
	        }
	        return "<" + digit + ">";
	    }

	    function toBase(n, base) {
	        base = bigInt(base);
	        if (base.isZero()) {
	            if (n.isZero()) return { value: [0], isNegative: false };
	            throw new Error("Cannot convert nonzero numbers to base 0.");
	        }
	        if (base.equals(-1)) {
	            if (n.isZero()) return { value: [0], isNegative: false };
	            if (n.isNegative())
	                return {
	                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
	                        .map(Array.prototype.valueOf, [1, 0])
	                    ),
	                    isNegative: false
	                };

	            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
	                .map(Array.prototype.valueOf, [0, 1]);
	            arr.unshift([1]);
	            return {
	                value: [].concat.apply([], arr),
	                isNegative: false
	            };
	        }

	        var neg = false;
	        if (n.isNegative() && base.isPositive()) {
	            neg = true;
	            n = n.abs();
	        }
	        if (base.isUnit()) {
	            if (n.isZero()) return { value: [0], isNegative: false };

	            return {
	                value: Array.apply(null, Array(n.toJSNumber()))
	                    .map(Number.prototype.valueOf, 1),
	                isNegative: neg
	            };
	        }
	        var out = [];
	        var left = n, divmod;
	        while (left.isNegative() || left.compareAbs(base) >= 0) {
	            divmod = left.divmod(base);
	            left = divmod.quotient;
	            var digit = divmod.remainder;
	            if (digit.isNegative()) {
	                digit = base.minus(digit).abs();
	                left = left.next();
	            }
	            out.push(digit.toJSNumber());
	        }
	        out.push(left.toJSNumber());
	        return { value: out.reverse(), isNegative: neg };
	    }

	    function toBaseString(n, base, alphabet) {
	        var arr = toBase(n, base);
	        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
	            return stringify(x, alphabet);
	        }).join('');
	    }

	    BigInteger.prototype.toArray = function (radix) {
	        return toBase(this, radix);
	    };

	    SmallInteger.prototype.toArray = function (radix) {
	        return toBase(this, radix);
	    };

	    NativeBigInt.prototype.toArray = function (radix) {
	        return toBase(this, radix);
	    };

	    BigInteger.prototype.toString = function (radix, alphabet) {
	        if (radix === undefined$1) radix = 10;
	        if (radix !== 10) return toBaseString(this, radix, alphabet);
	        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
	        while (--l >= 0) {
	            digit = String(v[l]);
	            str += zeros.slice(digit.length) + digit;
	        }
	        var sign = this.sign ? "-" : "";
	        return sign + str;
	    };

	    SmallInteger.prototype.toString = function (radix, alphabet) {
	        if (radix === undefined$1) radix = 10;
	        if (radix != 10) return toBaseString(this, radix, alphabet);
	        return String(this.value);
	    };

	    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

	    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); };

	    BigInteger.prototype.valueOf = function () {
	        return parseInt(this.toString(), 10);
	    };
	    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

	    SmallInteger.prototype.valueOf = function () {
	        return this.value;
	    };
	    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
	    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
	        return parseInt(this.toString(), 10);
	    };

	    function parseStringValue(v) {
	        if (isPrecise(+v)) {
	            var x = +v;
	            if (x === truncate(x))
	                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
	            throw new Error("Invalid integer: " + v);
	        }
	        var sign = v[0] === "-";
	        if (sign) v = v.slice(1);
	        var split = v.split(/e/i);
	        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
	        if (split.length === 2) {
	            var exp = split[1];
	            if (exp[0] === "+") exp = exp.slice(1);
	            exp = +exp;
	            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
	            var text = split[0];
	            var decimalPlace = text.indexOf(".");
	            if (decimalPlace >= 0) {
	                exp -= text.length - decimalPlace - 1;
	                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
	            }
	            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
	            text += (new Array(exp + 1)).join("0");
	            v = text;
	        }
	        var isValid = /^([0-9][0-9]*)$/.test(v);
	        if (!isValid) throw new Error("Invalid integer: " + v);
	        if (supportsNativeBigInt) {
	            return new NativeBigInt(BigInt(sign ? "-" + v : v));
	        }
	        var r = [], max = v.length, l = LOG_BASE, min = max - l;
	        while (max > 0) {
	            r.push(+v.slice(min, max));
	            min -= l;
	            if (min < 0) min = 0;
	            max -= l;
	        }
	        trim(r);
	        return new BigInteger(r, sign);
	    }

	    function parseNumberValue(v) {
	        if (supportsNativeBigInt) {
	            return new NativeBigInt(BigInt(v));
	        }
	        if (isPrecise(v)) {
	            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
	            return new SmallInteger(v);
	        }
	        return parseStringValue(v.toString());
	    }

	    function parseValue(v) {
	        if (typeof v === "number") {
	            return parseNumberValue(v);
	        }
	        if (typeof v === "string") {
	            return parseStringValue(v);
	        }
	        if (typeof v === "bigint") {
	            return new NativeBigInt(v);
	        }
	        return v;
	    }
	    // Pre-define numbers in range [-999,999]
	    for (var i = 0; i < 1000; i++) {
	        Integer[i] = parseValue(i);
	        if (i > 0) Integer[-i] = parseValue(-i);
	    }
	    // Backwards compatibility
	    Integer.one = Integer[1];
	    Integer.zero = Integer[0];
	    Integer.minusOne = Integer[-1];
	    Integer.max = max;
	    Integer.min = min;
	    Integer.gcd = gcd;
	    Integer.lcm = lcm;
	    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
	    Integer.randBetween = randBetween;

	    Integer.fromArray = function (digits, base, isNegative) {
	        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
	    };

	    return Integer;
	})();

	// Node.js check
	if (module.hasOwnProperty("exports")) {
	    module.exports = bigInt;
	}
	});

	/* eslint-disable indent */
	function getGForces(trackType, vehicleSpriteType, bankRotation, trackProgress, velocity) {
	    var lateralFactor = 0;
	    var vertFactor = 0;
	    switch (trackType) {
	        case TrackElemType.Flat:
	        case TrackElemType.EndStation:
	        case TrackElemType.BeginStation:
	        case TrackElemType.MiddleStation:
	        case TrackElemType.Up25:
	        case TrackElemType.Up60: //
	        case TrackElemType.Down25:
	        case TrackElemType.Down60: //
	        case TrackElemType.FlatToLeftBank:
	        case TrackElemType.FlatToRightBank:
	        case TrackElemType.LeftBankToFlat:
	        case TrackElemType.RightBankToFlat: //
	        case TrackElemType.LeftBank:
	        case TrackElemType.RightBank:
	        case TrackElemType.TowerBase:
	        case TrackElemType.TowerSection:
	        case TrackElemType.FlatCovered:
	        case TrackElemType.Up25Covered:
	        case TrackElemType.Up60Covered:
	        case TrackElemType.Down25Covered:
	        case TrackElemType.Down60Covered:
	        case TrackElemType.Brakes:
	        case TrackElemType.RotationControlToggle:
	        case TrackElemType.Maze:
	        case TrackElemType.Up25LeftBanked:
	        case TrackElemType.Up25RightBanked:
	        case TrackElemType.Waterfall:
	        case TrackElemType.Rapids:
	        case TrackElemType.OnRidePhoto:
	        case TrackElemType.Down25LeftBanked:
	        case TrackElemType.Down25RightBanked:
	        case TrackElemType.Whirlpool:
	        case TrackElemType.ReverseFreefallVertical:
	        case TrackElemType.Up90:
	        case TrackElemType.Down90:
	        case TrackElemType.DiagFlat:
	        case TrackElemType.DiagUp25:
	        case TrackElemType.DiagUp60:
	        case TrackElemType.DiagDown25:
	        case TrackElemType.DiagDown60:
	        case TrackElemType.DiagFlatToLeftBank:
	        case TrackElemType.DiagFlatToRightBank:
	        case TrackElemType.DiagLeftBankToFlat:
	        case TrackElemType.DiagRightBankToFlat:
	        case TrackElemType.DiagLeftBank:
	        case TrackElemType.DiagRightBank:
	        case TrackElemType.LogFlumeReverser:
	        case TrackElemType.SpinningTunnel:
	        case TrackElemType.PoweredLift:
	        case TrackElemType.MinigolfHoleA:
	        case TrackElemType.MinigolfHoleB:
	        case TrackElemType.MinigolfHoleC:
	        case TrackElemType.MinigolfHoleD:
	        case TrackElemType.MinigolfHoleE:
	        case TrackElemType.LeftReverser:
	        case TrackElemType.RightReverser:
	        case TrackElemType.AirThrustVerticalDown:
	        case TrackElemType.BlockBrakes:
	        case TrackElemType.Up25ToLeftBankedUp25:
	        case TrackElemType.Up25ToRightBankedUp25:
	        case TrackElemType.LeftBankedUp25ToUp25:
	        case TrackElemType.RightBankedUp25ToUp25:
	        case TrackElemType.Down25ToLeftBankedDown25:
	        case TrackElemType.Down25ToRightBankedDown25:
	        case TrackElemType.LeftBankedDown25ToDown25:
	        case TrackElemType.RightBankedDown25ToDown25:
	        case TrackElemType.LeftQuarterTurn1TileUp90:
	        case TrackElemType.RightQuarterTurn1TileUp90:
	        case TrackElemType.LeftQuarterTurn1TileDown90:
	        case TrackElemType.RightQuarterTurn1TileDown90:
	            // 6d73FF
	            // Do nothing
	            break;
	        case TrackElemType.FlatToUp25: //
	        case TrackElemType.Down25ToFlat: //
	        case TrackElemType.LeftBankToUp25:
	        case TrackElemType.RightBankToUp25:
	        case TrackElemType.Down25ToLeftBank:
	        case TrackElemType.Down25ToRightBank:
	        case TrackElemType.FlatToUp25Covered:
	        case TrackElemType.Down25ToFlatCovered:
	        case TrackElemType.LeftBankedFlatToLeftBankedUp25:
	        case TrackElemType.RightBankedFlatToRightBankedUp25:
	        case TrackElemType.LeftBankedDown25ToLeftBankedFlat:
	        case TrackElemType.RightBankedDown25ToRightBankedFlat:
	        case TrackElemType.FlatToLeftBankedUp25:
	        case TrackElemType.FlatToRightBankedUp25:
	        case TrackElemType.LeftBankedDown25ToFlat:
	        case TrackElemType.RightBankedDown25ToFlat:
	            vertFactor = 103;
	            // 6d7509
	            break;
	        case TrackElemType.Up25ToFlat: //
	        case TrackElemType.FlatToDown25: //
	        case TrackElemType.Up25ToLeftBank:
	        case TrackElemType.Up25ToRightBank:
	        case TrackElemType.LeftBankToDown25:
	        case TrackElemType.RightBankToDown25:
	        case TrackElemType.Up25ToFlatCovered:
	        case TrackElemType.FlatToDown25Covered:
	        case TrackElemType.CableLiftHill:
	        case TrackElemType.LeftBankedUp25ToLeftBankedFlat:
	        case TrackElemType.RightBankedUp25ToRightBankedFlat:
	        case TrackElemType.LeftBankedFlatToLeftBankedDown25:
	        case TrackElemType.RightBankedFlatToRightBankedDown25:
	        case TrackElemType.LeftBankedUp25ToFlat:
	        case TrackElemType.RightBankedUp25ToFlat:
	        case TrackElemType.FlatToLeftBankedDown25:
	        case TrackElemType.FlatToRightBankedDown25:
	            vertFactor = -103;
	            // 6d7569
	            break;
	        case TrackElemType.Up25ToUp60: //
	        case TrackElemType.Down60ToDown25: //
	        case TrackElemType.Up25ToUp60Covered:
	        case TrackElemType.Down60ToDown25Covered:
	            vertFactor = 82;
	            // 6d7545
	            break;
	        case TrackElemType.Up60ToUp25: //
	        case TrackElemType.Down25ToDown60: //
	        case TrackElemType.Up60ToUp25Covered:
	        case TrackElemType.Down25ToDown60Covered:
	            vertFactor = -82;
	            // 6d7551
	            break;
	        case TrackElemType.LeftQuarterTurn5Tiles: //
	        case TrackElemType.LeftQuarterTurn5TilesUp25:
	        case TrackElemType.LeftQuarterTurn5TilesDown25:
	        case TrackElemType.LeftTwistDownToUp:
	        case TrackElemType.LeftTwistUpToDown:
	        case TrackElemType.LeftQuarterTurn5TilesCovered:
	        case TrackElemType.LeftQuarterHelixLargeUp:
	        case TrackElemType.LeftQuarterHelixLargeDown:
	        case TrackElemType.LeftFlyerTwistUp:
	        case TrackElemType.LeftFlyerTwistDown:
	        case TrackElemType.LeftHeartLineRoll:
	            lateralFactor = 98;
	            // 6d7590
	            break;
	        case TrackElemType.RightQuarterTurn5Tiles: //
	        case TrackElemType.RightQuarterTurn5TilesUp25:
	        case TrackElemType.RightQuarterTurn5TilesDown25:
	        case TrackElemType.RightTwistDownToUp:
	        case TrackElemType.RightTwistUpToDown:
	        case TrackElemType.RightQuarterTurn5TilesCovered:
	        case TrackElemType.RightQuarterHelixLargeUp:
	        case TrackElemType.RightQuarterHelixLargeDown:
	        case TrackElemType.RightFlyerTwistUp:
	        case TrackElemType.RightFlyerTwistDown:
	        case TrackElemType.RightHeartLineRoll:
	            lateralFactor = -98;
	            // 6d75B7
	            break;
	        case TrackElemType.BankedLeftQuarterTurn5Tiles:
	        case TrackElemType.LeftHalfBankedHelixUpLarge:
	        case TrackElemType.LeftHalfBankedHelixDownLarge:
	        case TrackElemType.LeftQuarterBankedHelixLargeUp:
	        case TrackElemType.LeftQuarterBankedHelixLargeDown:
	            vertFactor = 200;
	            lateralFactor = 160;
	            // 6d75E1
	            break;
	        case TrackElemType.BankedRightQuarterTurn5Tiles:
	        case TrackElemType.RightHalfBankedHelixUpLarge:
	        case TrackElemType.RightHalfBankedHelixDownLarge:
	        case TrackElemType.RightQuarterBankedHelixLargeUp:
	        case TrackElemType.RightQuarterBankedHelixLargeDown:
	            vertFactor = 200;
	            lateralFactor = -160;
	            // 6d75F0
	            break;
	        case TrackElemType.SBendLeft:
	        case TrackElemType.SBendLeftCovered:
	            lateralFactor = (trackProgress < 48) ? 98 : -98;
	            // 6d75FF
	            break;
	        case TrackElemType.SBendRight:
	        case TrackElemType.SBendRightCovered:
	            lateralFactor = (trackProgress < 48) ? -98 : 98;
	            // 6d7608
	            break;
	        case TrackElemType.LeftVerticalLoop:
	        case TrackElemType.RightVerticalLoop:
	            vertFactor = (Math.abs(trackProgress - 155) / 2) + 28;
	            // 6d7690
	            break;
	        case TrackElemType.LeftQuarterTurn3Tiles:
	        case TrackElemType.LeftQuarterTurn3TilesUp25:
	        case TrackElemType.LeftQuarterTurn3TilesDown25:
	        case TrackElemType.LeftQuarterTurn3TilesCovered:
	        case TrackElemType.LeftCurvedLiftHill:
	            lateralFactor = 59;
	            // 6d7704
	            break;
	        case TrackElemType.RightQuarterTurn3Tiles:
	        case TrackElemType.RightQuarterTurn3TilesUp25:
	        case TrackElemType.RightQuarterTurn3TilesDown25:
	        case TrackElemType.RightQuarterTurn3TilesCovered:
	        case TrackElemType.RightCurvedLiftHill:
	            lateralFactor = -59;
	            // 6d7710
	            break;
	        case TrackElemType.LeftBankedQuarterTurn3Tiles:
	        case TrackElemType.LeftHalfBankedHelixUpSmall:
	        case TrackElemType.LeftHalfBankedHelixDownSmall:
	            vertFactor = 100;
	            lateralFactor = 100;
	            // 6d7782
	            break;
	        case TrackElemType.RightBankedQuarterTurn3Tiles:
	        case TrackElemType.RightHalfBankedHelixUpSmall:
	        case TrackElemType.RightHalfBankedHelixDownSmall:
	            vertFactor = 100;
	            lateralFactor = -100;
	            // 6d778E
	            break;
	        case TrackElemType.LeftQuarterTurn1Tile:
	            lateralFactor = 45;
	            // 6d779A
	            break;
	        case TrackElemType.RightQuarterTurn1Tile:
	            lateralFactor = -45;
	            // 6d77A3
	            break;
	        case TrackElemType.HalfLoopUp:
	        case TrackElemType.FlyerHalfLoopUp:
	            vertFactor = (((-(trackProgress - 155))) / 2) + 28;
	            // 6d763E
	            break;
	        case TrackElemType.HalfLoopDown:
	        case TrackElemType.FlyerHalfLoopDown:
	            vertFactor = (trackProgress / 2) + 28;
	            // 6d7656
	            break;
	        case TrackElemType.LeftCorkscrewUp:
	        case TrackElemType.RightCorkscrewDown:
	        case TrackElemType.LeftFlyerCorkscrewUp:
	        case TrackElemType.RightFlyerCorkscrewDown:
	            vertFactor = 52;
	            lateralFactor = 70;
	            // 6d76AA
	            break;
	        case TrackElemType.RightCorkscrewUp:
	        case TrackElemType.LeftCorkscrewDown:
	        case TrackElemType.RightFlyerCorkscrewUp:
	        case TrackElemType.LeftFlyerCorkscrewDown:
	            vertFactor = 52;
	            lateralFactor = -70;
	            // 6d76B9
	            break;
	        case TrackElemType.FlatToUp60:
	        case TrackElemType.Down60ToFlat:
	            vertFactor = 56;
	            // 6d747C
	            break;
	        case TrackElemType.Up60ToFlat:
	        case TrackElemType.FlatToDown60:
	        case TrackElemType.BrakeForDrop:
	            vertFactor = -56;
	            // 6d7488
	            break;
	        case TrackElemType.LeftQuarterTurn1TileUp60:
	        case TrackElemType.LeftQuarterTurn1TileDown60:
	            lateralFactor = 88;
	            // 6d7770
	            break;
	        case TrackElemType.RightQuarterTurn1TileUp60:
	        case TrackElemType.RightQuarterTurn1TileDown60:
	            lateralFactor = -88;
	            // 6d7779
	            break;
	        case TrackElemType.Watersplash:
	            vertFactor = -150;
	            if (trackProgress < 32)
	                break;
	            vertFactor = 150;
	            if (trackProgress < 64)
	                break;
	            vertFactor = 0;
	            if (trackProgress < 96)
	                break;
	            vertFactor = 150;
	            if (trackProgress < 128)
	                break;
	            vertFactor = -150;
	            // 6d7408
	            break;
	        case TrackElemType.FlatToUp60LongBase:
	        case TrackElemType.Down60ToFlatLongBase:
	            vertFactor = 160;
	            // 6d74F1
	            break;
	        case TrackElemType.Up60ToFlatLongBase:
	        case TrackElemType.FlatToDown60LongBase:
	            vertFactor = -160;
	            // 6d74FD
	            break;
	        case TrackElemType.ReverseFreefallSlope:
	        case TrackElemType.AirThrustVerticalDownToLevel:
	            vertFactor = 120;
	            // 6d7458
	            break;
	        case TrackElemType.Up60ToUp90:
	        case TrackElemType.Down90ToDown60:
	            vertFactor = 110;
	            // 6d7515
	            break;
	        case TrackElemType.Up90ToUp60:
	        case TrackElemType.Down60ToDown90:
	            vertFactor = -110;
	            // 6d7521
	            break;
	        case TrackElemType.LeftEighthToDiag:
	        case TrackElemType.LeftEighthToOrthogonal:
	            lateralFactor = 137;
	            // 6d7575
	            break;
	        case TrackElemType.RightEighthToDiag:
	        case TrackElemType.RightEighthToOrthogonal:
	            lateralFactor = -137;
	            // 6d759C
	            break;
	        case TrackElemType.LeftEighthBankToDiag:
	        case TrackElemType.LeftEighthBankToOrthogonal:
	            vertFactor = 270;
	            lateralFactor = 200;
	            // 6d75C3
	            break;
	        case TrackElemType.RightEighthBankToDiag:
	        case TrackElemType.RightEighthBankToOrthogonal:
	            vertFactor = 270;
	            lateralFactor = -200;
	            // 6d75D2
	            break;
	        case TrackElemType.DiagFlatToUp25:
	        case TrackElemType.DiagDown25ToFlat:
	        case TrackElemType.DiagLeftBankToUp25:
	        case TrackElemType.DiagRightBankToUp25:
	        case TrackElemType.DiagDown25ToLeftBank:
	        case TrackElemType.DiagDown25ToRightBank:
	            vertFactor = 113;
	            // 6d7494
	            break;
	        case TrackElemType.DiagUp25ToFlat:
	        case TrackElemType.DiagFlatToDown25:
	        case TrackElemType.DiagUp25ToLeftBank:
	        case TrackElemType.DiagUp25ToRightBank:
	        case TrackElemType.DiagLeftBankToDown25:
	        case TrackElemType.DiagRightBankToDown25:
	            vertFactor = -113;
	            // 6d755D
	            break;
	        case TrackElemType.DiagUp25ToUp60:
	        case TrackElemType.DiagDown60ToDown25:
	            vertFactor = 95;
	            // 6D752D
	            break;
	        case TrackElemType.DiagUp60ToUp25:
	        case TrackElemType.DiagDown25ToDown60:
	            vertFactor = -95;
	            // 6D7539
	            break;
	        case TrackElemType.DiagFlatToUp60:
	        case TrackElemType.DiagDown60ToFlat:
	            vertFactor = 60;
	            // 6D7464
	            break;
	        case TrackElemType.DiagUp60ToFlat:
	        case TrackElemType.DiagFlatToDown60:
	            vertFactor = -60;
	            // 6d7470
	            break;
	        case TrackElemType.LeftBarrelRollUpToDown:
	        case TrackElemType.LeftBarrelRollDownToUp:
	            vertFactor = 170;
	            lateralFactor = 115;
	            // 6d7581
	            break;
	        case TrackElemType.RightBarrelRollUpToDown:
	        case TrackElemType.RightBarrelRollDownToUp:
	            vertFactor = 170;
	            lateralFactor = -115;
	            // 6d75A8
	            break;
	        case TrackElemType.LeftBankToLeftQuarterTurn3TilesUp25:
	            vertFactor = -(trackProgress / 2) + 134;
	            lateralFactor = 90;
	            // 6d771C
	            break;
	        case TrackElemType.RightBankToRightQuarterTurn3TilesUp25:
	            vertFactor = -(trackProgress / 2) + 134;
	            lateralFactor = -90;
	            // 6D7746
	            break;
	        case TrackElemType.LeftQuarterTurn3TilesDown25ToLeftBank:
	            vertFactor = -(trackProgress / 2) + 134;
	            lateralFactor = 90;
	            // 6D7731 identical to 6d771c
	            break;
	        case TrackElemType.RightQuarterTurn3TilesDown25ToRightBank:
	            vertFactor = -(trackProgress / 2) + 134;
	            lateralFactor = -90;
	            // 6D775B identical to 6d7746
	            break;
	        case TrackElemType.LeftLargeHalfLoopUp:
	        case TrackElemType.RightLargeHalfLoopUp:
	            vertFactor = (((-(trackProgress - 311))) / 4) + 46;
	            // 6d7666
	            break;
	        case TrackElemType.RightLargeHalfLoopDown:
	        case TrackElemType.LeftLargeHalfLoopDown:
	            vertFactor = (trackProgress / 4) + 46;
	            // 6d767F
	            break;
	        case TrackElemType.HeartLineTransferUp:
	            vertFactor = 103;
	            if (trackProgress < 32)
	                break;
	            vertFactor = -103;
	            if (trackProgress < 64)
	                break;
	            vertFactor = 0;
	            if (trackProgress < 96)
	                break;
	            vertFactor = 103;
	            if (trackProgress < 128)
	                break;
	            vertFactor = -103;
	            // 6d74A0
	            break;
	        case TrackElemType.HeartLineTransferDown:
	            vertFactor = -103;
	            if (trackProgress < 32)
	                break;
	            vertFactor = 103;
	            if (trackProgress < 64)
	                break;
	            vertFactor = 0;
	            if (trackProgress < 96)
	                break;
	            vertFactor = -103;
	            if (trackProgress < 128)
	                break;
	            vertFactor = 103;
	            // 6D74CA
	            break;
	        case TrackElemType.MultiDimInvertedFlatToDown90QuarterLoop:
	        case TrackElemType.InvertedFlatToDown90QuarterLoop:
	        case TrackElemType.MultiDimFlatToDown90QuarterLoop:
	            vertFactor = (trackProgress / 4) + 55;
	            // 6d762D
	            break;
	        case TrackElemType.Up90ToInvertedFlatQuarterLoop:
	        case TrackElemType.MultiDimUp90ToInvertedFlatQuarterLoop:
	        case TrackElemType.MultiDimInvertedUp90ToFlatQuarterLoop:
	            vertFactor = (((-(trackProgress - 137))) / 4) + 55;
	            // 6D7614
	            break;
	        case TrackElemType.AirThrustTopCap:
	            vertFactor = -60;
	            // 6D744C
	            break;
	        case TrackElemType.LeftBankedQuarterTurn3TileUp25:
	        case TrackElemType.LeftBankedQuarterTurn3TileDown25:
	            vertFactor = 200;
	            lateralFactor = 100;
	            // 6d76C8
	            break;
	        case TrackElemType.RightBankedQuarterTurn3TileUp25:
	        case TrackElemType.RightBankedQuarterTurn3TileDown25:
	            vertFactor = 200;
	            lateralFactor = -100;
	            // 6d76d7
	            break;
	        case TrackElemType.LeftBankedQuarterTurn5TileUp25:
	        case TrackElemType.LeftBankedQuarterTurn5TileDown25:
	            vertFactor = 200;
	            lateralFactor = 160;
	            // 6D76E6
	            break;
	        case TrackElemType.RightBankedQuarterTurn5TileUp25:
	        case TrackElemType.RightBankedQuarterTurn5TileDown25:
	            vertFactor = 200;
	            lateralFactor = -160;
	            // 6d76F5
	            break;
	    }
	    var gForceLateral = 0;
	    var gForceVertBig = (BigInteger(0x280000).multiply(Unk9A37E4[vehicleSpriteType])).shiftRight(32);
	    gForceVertBig = (BigInteger(gForceVertBig).multiply(Unk9A39C4[bankRotation])).shiftRight(32);
	    var gForceVert = gForceVertBig.toJSNumber();
	    if (vertFactor != 0) {
	        gForceVert += Math.abs(velocity) * 98 / vertFactor;
	    }
	    if (lateralFactor != 0) {
	        gForceLateral += Math.abs(velocity) * 98 / lateralFactor;
	    }
	    gForceVert = Math.floor(gForceVert);
	    gForceVert *= 10;
	    gForceLateral *= 10;
	    gForceVert >>= 16;
	    gForceLateral >>= 16;
	    return {
	        gForceVert: gForceVert,
	        gForceLateral: gForceLateral,
	    };
	}
	var TrackElemType;
	(function (TrackElemType) {
	    TrackElemType[TrackElemType["Flat"] = 0] = "Flat";
	    TrackElemType[TrackElemType["EndStation"] = 1] = "EndStation";
	    TrackElemType[TrackElemType["BeginStation"] = 2] = "BeginStation";
	    TrackElemType[TrackElemType["MiddleStation"] = 3] = "MiddleStation";
	    TrackElemType[TrackElemType["Up25"] = 4] = "Up25";
	    TrackElemType[TrackElemType["Up60"] = 5] = "Up60";
	    TrackElemType[TrackElemType["FlatToUp25"] = 6] = "FlatToUp25";
	    TrackElemType[TrackElemType["Up25ToUp60"] = 7] = "Up25ToUp60";
	    TrackElemType[TrackElemType["Up60ToUp25"] = 8] = "Up60ToUp25";
	    TrackElemType[TrackElemType["Up25ToFlat"] = 9] = "Up25ToFlat";
	    TrackElemType[TrackElemType["Down25"] = 10] = "Down25";
	    TrackElemType[TrackElemType["Down60"] = 11] = "Down60";
	    TrackElemType[TrackElemType["FlatToDown25"] = 12] = "FlatToDown25";
	    TrackElemType[TrackElemType["Down25ToDown60"] = 13] = "Down25ToDown60";
	    TrackElemType[TrackElemType["Down60ToDown25"] = 14] = "Down60ToDown25";
	    TrackElemType[TrackElemType["Down25ToFlat"] = 15] = "Down25ToFlat";
	    TrackElemType[TrackElemType["LeftQuarterTurn5Tiles"] = 16] = "LeftQuarterTurn5Tiles";
	    TrackElemType[TrackElemType["RightQuarterTurn5Tiles"] = 17] = "RightQuarterTurn5Tiles";
	    TrackElemType[TrackElemType["FlatToLeftBank"] = 18] = "FlatToLeftBank";
	    TrackElemType[TrackElemType["FlatToRightBank"] = 19] = "FlatToRightBank";
	    TrackElemType[TrackElemType["LeftBankToFlat"] = 20] = "LeftBankToFlat";
	    TrackElemType[TrackElemType["RightBankToFlat"] = 21] = "RightBankToFlat";
	    TrackElemType[TrackElemType["BankedLeftQuarterTurn5Tiles"] = 22] = "BankedLeftQuarterTurn5Tiles";
	    TrackElemType[TrackElemType["BankedRightQuarterTurn5Tiles"] = 23] = "BankedRightQuarterTurn5Tiles";
	    TrackElemType[TrackElemType["LeftBankToUp25"] = 24] = "LeftBankToUp25";
	    TrackElemType[TrackElemType["RightBankToUp25"] = 25] = "RightBankToUp25";
	    TrackElemType[TrackElemType["Up25ToLeftBank"] = 26] = "Up25ToLeftBank";
	    TrackElemType[TrackElemType["Up25ToRightBank"] = 27] = "Up25ToRightBank";
	    TrackElemType[TrackElemType["LeftBankToDown25"] = 28] = "LeftBankToDown25";
	    TrackElemType[TrackElemType["RightBankToDown25"] = 29] = "RightBankToDown25";
	    TrackElemType[TrackElemType["Down25ToLeftBank"] = 30] = "Down25ToLeftBank";
	    TrackElemType[TrackElemType["Down25ToRightBank"] = 31] = "Down25ToRightBank";
	    TrackElemType[TrackElemType["LeftBank"] = 32] = "LeftBank";
	    TrackElemType[TrackElemType["RightBank"] = 33] = "RightBank";
	    TrackElemType[TrackElemType["LeftQuarterTurn5TilesUp25"] = 34] = "LeftQuarterTurn5TilesUp25";
	    TrackElemType[TrackElemType["RightQuarterTurn5TilesUp25"] = 35] = "RightQuarterTurn5TilesUp25";
	    TrackElemType[TrackElemType["LeftQuarterTurn5TilesDown25"] = 36] = "LeftQuarterTurn5TilesDown25";
	    TrackElemType[TrackElemType["RightQuarterTurn5TilesDown25"] = 37] = "RightQuarterTurn5TilesDown25";
	    TrackElemType[TrackElemType["SBendLeft"] = 38] = "SBendLeft";
	    TrackElemType[TrackElemType["SBendRight"] = 39] = "SBendRight";
	    TrackElemType[TrackElemType["LeftVerticalLoop"] = 40] = "LeftVerticalLoop";
	    TrackElemType[TrackElemType["RightVerticalLoop"] = 41] = "RightVerticalLoop";
	    TrackElemType[TrackElemType["LeftQuarterTurn3Tiles"] = 42] = "LeftQuarterTurn3Tiles";
	    TrackElemType[TrackElemType["RightQuarterTurn3Tiles"] = 43] = "RightQuarterTurn3Tiles";
	    TrackElemType[TrackElemType["LeftBankedQuarterTurn3Tiles"] = 44] = "LeftBankedQuarterTurn3Tiles";
	    TrackElemType[TrackElemType["RightBankedQuarterTurn3Tiles"] = 45] = "RightBankedQuarterTurn3Tiles";
	    TrackElemType[TrackElemType["LeftQuarterTurn3TilesUp25"] = 46] = "LeftQuarterTurn3TilesUp25";
	    TrackElemType[TrackElemType["RightQuarterTurn3TilesUp25"] = 47] = "RightQuarterTurn3TilesUp25";
	    TrackElemType[TrackElemType["LeftQuarterTurn3TilesDown25"] = 48] = "LeftQuarterTurn3TilesDown25";
	    TrackElemType[TrackElemType["RightQuarterTurn3TilesDown25"] = 49] = "RightQuarterTurn3TilesDown25";
	    TrackElemType[TrackElemType["LeftQuarterTurn1Tile"] = 50] = "LeftQuarterTurn1Tile";
	    TrackElemType[TrackElemType["RightQuarterTurn1Tile"] = 51] = "RightQuarterTurn1Tile";
	    TrackElemType[TrackElemType["LeftTwistDownToUp"] = 52] = "LeftTwistDownToUp";
	    TrackElemType[TrackElemType["RightTwistDownToUp"] = 53] = "RightTwistDownToUp";
	    TrackElemType[TrackElemType["LeftTwistUpToDown"] = 54] = "LeftTwistUpToDown";
	    TrackElemType[TrackElemType["RightTwistUpToDown"] = 55] = "RightTwistUpToDown";
	    TrackElemType[TrackElemType["HalfLoopUp"] = 56] = "HalfLoopUp";
	    TrackElemType[TrackElemType["HalfLoopDown"] = 57] = "HalfLoopDown";
	    TrackElemType[TrackElemType["LeftCorkscrewUp"] = 58] = "LeftCorkscrewUp";
	    TrackElemType[TrackElemType["RightCorkscrewUp"] = 59] = "RightCorkscrewUp";
	    TrackElemType[TrackElemType["LeftCorkscrewDown"] = 60] = "LeftCorkscrewDown";
	    TrackElemType[TrackElemType["RightCorkscrewDown"] = 61] = "RightCorkscrewDown";
	    TrackElemType[TrackElemType["FlatToUp60"] = 62] = "FlatToUp60";
	    TrackElemType[TrackElemType["Up60ToFlat"] = 63] = "Up60ToFlat";
	    TrackElemType[TrackElemType["FlatToDown60"] = 64] = "FlatToDown60";
	    TrackElemType[TrackElemType["Down60ToFlat"] = 65] = "Down60ToFlat";
	    TrackElemType[TrackElemType["TowerBase"] = 66] = "TowerBase";
	    TrackElemType[TrackElemType["TowerSection"] = 67] = "TowerSection";
	    TrackElemType[TrackElemType["FlatCovered"] = 68] = "FlatCovered";
	    TrackElemType[TrackElemType["Up25Covered"] = 69] = "Up25Covered";
	    TrackElemType[TrackElemType["Up60Covered"] = 70] = "Up60Covered";
	    TrackElemType[TrackElemType["FlatToUp25Covered"] = 71] = "FlatToUp25Covered";
	    TrackElemType[TrackElemType["Up25ToUp60Covered"] = 72] = "Up25ToUp60Covered";
	    TrackElemType[TrackElemType["Up60ToUp25Covered"] = 73] = "Up60ToUp25Covered";
	    TrackElemType[TrackElemType["Up25ToFlatCovered"] = 74] = "Up25ToFlatCovered";
	    TrackElemType[TrackElemType["Down25Covered"] = 75] = "Down25Covered";
	    TrackElemType[TrackElemType["Down60Covered"] = 76] = "Down60Covered";
	    TrackElemType[TrackElemType["FlatToDown25Covered"] = 77] = "FlatToDown25Covered";
	    TrackElemType[TrackElemType["Down25ToDown60Covered"] = 78] = "Down25ToDown60Covered";
	    TrackElemType[TrackElemType["Down60ToDown25Covered"] = 79] = "Down60ToDown25Covered";
	    TrackElemType[TrackElemType["Down25ToFlatCovered"] = 80] = "Down25ToFlatCovered";
	    TrackElemType[TrackElemType["LeftQuarterTurn5TilesCovered"] = 81] = "LeftQuarterTurn5TilesCovered";
	    TrackElemType[TrackElemType["RightQuarterTurn5TilesCovered"] = 82] = "RightQuarterTurn5TilesCovered";
	    TrackElemType[TrackElemType["SBendLeftCovered"] = 83] = "SBendLeftCovered";
	    TrackElemType[TrackElemType["SBendRightCovered"] = 84] = "SBendRightCovered";
	    TrackElemType[TrackElemType["LeftQuarterTurn3TilesCovered"] = 85] = "LeftQuarterTurn3TilesCovered";
	    TrackElemType[TrackElemType["RightQuarterTurn3TilesCovered"] = 86] = "RightQuarterTurn3TilesCovered";
	    TrackElemType[TrackElemType["LeftHalfBankedHelixUpSmall"] = 87] = "LeftHalfBankedHelixUpSmall";
	    TrackElemType[TrackElemType["RightHalfBankedHelixUpSmall"] = 88] = "RightHalfBankedHelixUpSmall";
	    TrackElemType[TrackElemType["LeftHalfBankedHelixDownSmall"] = 89] = "LeftHalfBankedHelixDownSmall";
	    TrackElemType[TrackElemType["RightHalfBankedHelixDownSmall"] = 90] = "RightHalfBankedHelixDownSmall";
	    TrackElemType[TrackElemType["LeftHalfBankedHelixUpLarge"] = 91] = "LeftHalfBankedHelixUpLarge";
	    TrackElemType[TrackElemType["RightHalfBankedHelixUpLarge"] = 92] = "RightHalfBankedHelixUpLarge";
	    TrackElemType[TrackElemType["LeftHalfBankedHelixDownLarge"] = 93] = "LeftHalfBankedHelixDownLarge";
	    TrackElemType[TrackElemType["RightHalfBankedHelixDownLarge"] = 94] = "RightHalfBankedHelixDownLarge";
	    TrackElemType[TrackElemType["LeftQuarterTurn1TileUp60"] = 95] = "LeftQuarterTurn1TileUp60";
	    TrackElemType[TrackElemType["RightQuarterTurn1TileUp60"] = 96] = "RightQuarterTurn1TileUp60";
	    TrackElemType[TrackElemType["LeftQuarterTurn1TileDown60"] = 97] = "LeftQuarterTurn1TileDown60";
	    TrackElemType[TrackElemType["RightQuarterTurn1TileDown60"] = 98] = "RightQuarterTurn1TileDown60";
	    TrackElemType[TrackElemType["Brakes"] = 99] = "Brakes";
	    TrackElemType[TrackElemType["RotationControlToggleAlias"] = 100] = "RotationControlToggleAlias";
	    TrackElemType[TrackElemType["Booster"] = 100] = "Booster";
	    TrackElemType[TrackElemType["Maze"] = 101] = "Maze";
	    // Used by the multi-dimension coaster, as TD6 cannot handle index 255.
	    TrackElemType[TrackElemType["InvertedUp90ToFlatQuarterLoopAlias"] = 101] = "InvertedUp90ToFlatQuarterLoopAlias";
	    TrackElemType[TrackElemType["LeftQuarterBankedHelixLargeUp"] = 102] = "LeftQuarterBankedHelixLargeUp";
	    TrackElemType[TrackElemType["RightQuarterBankedHelixLargeUp"] = 103] = "RightQuarterBankedHelixLargeUp";
	    TrackElemType[TrackElemType["LeftQuarterBankedHelixLargeDown"] = 104] = "LeftQuarterBankedHelixLargeDown";
	    TrackElemType[TrackElemType["RightQuarterBankedHelixLargeDown"] = 105] = "RightQuarterBankedHelixLargeDown";
	    TrackElemType[TrackElemType["LeftQuarterHelixLargeUp"] = 106] = "LeftQuarterHelixLargeUp";
	    TrackElemType[TrackElemType["RightQuarterHelixLargeUp"] = 107] = "RightQuarterHelixLargeUp";
	    TrackElemType[TrackElemType["LeftQuarterHelixLargeDown"] = 108] = "LeftQuarterHelixLargeDown";
	    TrackElemType[TrackElemType["RightQuarterHelixLargeDown"] = 109] = "RightQuarterHelixLargeDown";
	    TrackElemType[TrackElemType["Up25LeftBanked"] = 110] = "Up25LeftBanked";
	    TrackElemType[TrackElemType["Up25RightBanked"] = 111] = "Up25RightBanked";
	    TrackElemType[TrackElemType["Waterfall"] = 112] = "Waterfall";
	    TrackElemType[TrackElemType["Rapids"] = 113] = "Rapids";
	    TrackElemType[TrackElemType["OnRidePhoto"] = 114] = "OnRidePhoto";
	    TrackElemType[TrackElemType["Down25LeftBanked"] = 115] = "Down25LeftBanked";
	    TrackElemType[TrackElemType["Down25RightBanked"] = 116] = "Down25RightBanked";
	    TrackElemType[TrackElemType["Watersplash"] = 117] = "Watersplash";
	    TrackElemType[TrackElemType["FlatToUp60LongBase"] = 118] = "FlatToUp60LongBase";
	    TrackElemType[TrackElemType["Up60ToFlatLongBase"] = 119] = "Up60ToFlatLongBase";
	    TrackElemType[TrackElemType["Whirlpool"] = 120] = "Whirlpool";
	    TrackElemType[TrackElemType["Down60ToFlatLongBase"] = 121] = "Down60ToFlatLongBase";
	    TrackElemType[TrackElemType["FlatToDown60LongBase"] = 122] = "FlatToDown60LongBase";
	    TrackElemType[TrackElemType["CableLiftHill"] = 123] = "CableLiftHill";
	    TrackElemType[TrackElemType["ReverseFreefallSlope"] = 124] = "ReverseFreefallSlope";
	    TrackElemType[TrackElemType["ReverseFreefallVertical"] = 125] = "ReverseFreefallVertical";
	    TrackElemType[TrackElemType["Up90"] = 126] = "Up90";
	    TrackElemType[TrackElemType["Down90"] = 127] = "Down90";
	    TrackElemType[TrackElemType["Up60ToUp90"] = 128] = "Up60ToUp90";
	    TrackElemType[TrackElemType["Down90ToDown60"] = 129] = "Down90ToDown60";
	    TrackElemType[TrackElemType["Up90ToUp60"] = 130] = "Up90ToUp60";
	    TrackElemType[TrackElemType["Down60ToDown90"] = 131] = "Down60ToDown90";
	    TrackElemType[TrackElemType["BrakeForDrop"] = 132] = "BrakeForDrop";
	    TrackElemType[TrackElemType["LeftEighthToDiag"] = 133] = "LeftEighthToDiag";
	    TrackElemType[TrackElemType["RightEighthToDiag"] = 134] = "RightEighthToDiag";
	    TrackElemType[TrackElemType["LeftEighthToOrthogonal"] = 135] = "LeftEighthToOrthogonal";
	    TrackElemType[TrackElemType["RightEighthToOrthogonal"] = 136] = "RightEighthToOrthogonal";
	    TrackElemType[TrackElemType["LeftEighthBankToDiag"] = 137] = "LeftEighthBankToDiag";
	    TrackElemType[TrackElemType["RightEighthBankToDiag"] = 138] = "RightEighthBankToDiag";
	    TrackElemType[TrackElemType["LeftEighthBankToOrthogonal"] = 139] = "LeftEighthBankToOrthogonal";
	    TrackElemType[TrackElemType["RightEighthBankToOrthogonal"] = 140] = "RightEighthBankToOrthogonal";
	    TrackElemType[TrackElemType["DiagFlat"] = 141] = "DiagFlat";
	    TrackElemType[TrackElemType["DiagUp25"] = 142] = "DiagUp25";
	    TrackElemType[TrackElemType["DiagUp60"] = 143] = "DiagUp60";
	    TrackElemType[TrackElemType["DiagFlatToUp25"] = 144] = "DiagFlatToUp25";
	    TrackElemType[TrackElemType["DiagUp25ToUp60"] = 145] = "DiagUp25ToUp60";
	    TrackElemType[TrackElemType["DiagUp60ToUp25"] = 146] = "DiagUp60ToUp25";
	    TrackElemType[TrackElemType["DiagUp25ToFlat"] = 147] = "DiagUp25ToFlat";
	    TrackElemType[TrackElemType["DiagDown25"] = 148] = "DiagDown25";
	    TrackElemType[TrackElemType["DiagDown60"] = 149] = "DiagDown60";
	    TrackElemType[TrackElemType["DiagFlatToDown25"] = 150] = "DiagFlatToDown25";
	    TrackElemType[TrackElemType["DiagDown25ToDown60"] = 151] = "DiagDown25ToDown60";
	    TrackElemType[TrackElemType["DiagDown60ToDown25"] = 152] = "DiagDown60ToDown25";
	    TrackElemType[TrackElemType["DiagDown25ToFlat"] = 153] = "DiagDown25ToFlat";
	    TrackElemType[TrackElemType["DiagFlatToUp60"] = 154] = "DiagFlatToUp60";
	    TrackElemType[TrackElemType["DiagUp60ToFlat"] = 155] = "DiagUp60ToFlat";
	    TrackElemType[TrackElemType["DiagFlatToDown60"] = 156] = "DiagFlatToDown60";
	    TrackElemType[TrackElemType["DiagDown60ToFlat"] = 157] = "DiagDown60ToFlat";
	    TrackElemType[TrackElemType["DiagFlatToLeftBank"] = 158] = "DiagFlatToLeftBank";
	    TrackElemType[TrackElemType["DiagFlatToRightBank"] = 159] = "DiagFlatToRightBank";
	    TrackElemType[TrackElemType["DiagLeftBankToFlat"] = 160] = "DiagLeftBankToFlat";
	    TrackElemType[TrackElemType["DiagRightBankToFlat"] = 161] = "DiagRightBankToFlat";
	    TrackElemType[TrackElemType["DiagLeftBankToUp25"] = 162] = "DiagLeftBankToUp25";
	    TrackElemType[TrackElemType["DiagRightBankToUp25"] = 163] = "DiagRightBankToUp25";
	    TrackElemType[TrackElemType["DiagUp25ToLeftBank"] = 164] = "DiagUp25ToLeftBank";
	    TrackElemType[TrackElemType["DiagUp25ToRightBank"] = 165] = "DiagUp25ToRightBank";
	    TrackElemType[TrackElemType["DiagLeftBankToDown25"] = 166] = "DiagLeftBankToDown25";
	    TrackElemType[TrackElemType["DiagRightBankToDown25"] = 167] = "DiagRightBankToDown25";
	    TrackElemType[TrackElemType["DiagDown25ToLeftBank"] = 168] = "DiagDown25ToLeftBank";
	    TrackElemType[TrackElemType["DiagDown25ToRightBank"] = 169] = "DiagDown25ToRightBank";
	    TrackElemType[TrackElemType["DiagLeftBank"] = 170] = "DiagLeftBank";
	    TrackElemType[TrackElemType["DiagRightBank"] = 171] = "DiagRightBank";
	    TrackElemType[TrackElemType["LogFlumeReverser"] = 172] = "LogFlumeReverser";
	    TrackElemType[TrackElemType["SpinningTunnel"] = 173] = "SpinningTunnel";
	    TrackElemType[TrackElemType["LeftBarrelRollUpToDown"] = 174] = "LeftBarrelRollUpToDown";
	    TrackElemType[TrackElemType["RightBarrelRollUpToDown"] = 175] = "RightBarrelRollUpToDown";
	    TrackElemType[TrackElemType["LeftBarrelRollDownToUp"] = 176] = "LeftBarrelRollDownToUp";
	    TrackElemType[TrackElemType["RightBarrelRollDownToUp"] = 177] = "RightBarrelRollDownToUp";
	    TrackElemType[TrackElemType["LeftBankToLeftQuarterTurn3TilesUp25"] = 178] = "LeftBankToLeftQuarterTurn3TilesUp25";
	    TrackElemType[TrackElemType["RightBankToRightQuarterTurn3TilesUp25"] = 179] = "RightBankToRightQuarterTurn3TilesUp25";
	    TrackElemType[TrackElemType["LeftQuarterTurn3TilesDown25ToLeftBank"] = 180] = "LeftQuarterTurn3TilesDown25ToLeftBank";
	    TrackElemType[TrackElemType["RightQuarterTurn3TilesDown25ToRightBank"] = 181] = "RightQuarterTurn3TilesDown25ToRightBank";
	    TrackElemType[TrackElemType["PoweredLift"] = 182] = "PoweredLift";
	    TrackElemType[TrackElemType["LeftLargeHalfLoopUp"] = 183] = "LeftLargeHalfLoopUp";
	    TrackElemType[TrackElemType["RightLargeHalfLoopUp"] = 184] = "RightLargeHalfLoopUp";
	    TrackElemType[TrackElemType["RightLargeHalfLoopDown"] = 185] = "RightLargeHalfLoopDown";
	    TrackElemType[TrackElemType["LeftLargeHalfLoopDown"] = 186] = "LeftLargeHalfLoopDown";
	    TrackElemType[TrackElemType["LeftFlyerTwistUp"] = 187] = "LeftFlyerTwistUp";
	    TrackElemType[TrackElemType["RightFlyerTwistUp"] = 188] = "RightFlyerTwistUp";
	    TrackElemType[TrackElemType["LeftFlyerTwistDown"] = 189] = "LeftFlyerTwistDown";
	    TrackElemType[TrackElemType["RightFlyerTwistDown"] = 190] = "RightFlyerTwistDown";
	    TrackElemType[TrackElemType["FlyerHalfLoopUp"] = 191] = "FlyerHalfLoopUp";
	    TrackElemType[TrackElemType["FlyerHalfLoopDown"] = 192] = "FlyerHalfLoopDown";
	    TrackElemType[TrackElemType["LeftFlyerCorkscrewUp"] = 193] = "LeftFlyerCorkscrewUp";
	    TrackElemType[TrackElemType["RightFlyerCorkscrewUp"] = 194] = "RightFlyerCorkscrewUp";
	    TrackElemType[TrackElemType["LeftFlyerCorkscrewDown"] = 195] = "LeftFlyerCorkscrewDown";
	    TrackElemType[TrackElemType["RightFlyerCorkscrewDown"] = 196] = "RightFlyerCorkscrewDown";
	    TrackElemType[TrackElemType["HeartLineTransferUp"] = 197] = "HeartLineTransferUp";
	    TrackElemType[TrackElemType["HeartLineTransferDown"] = 198] = "HeartLineTransferDown";
	    TrackElemType[TrackElemType["LeftHeartLineRoll"] = 199] = "LeftHeartLineRoll";
	    TrackElemType[TrackElemType["RightHeartLineRoll"] = 200] = "RightHeartLineRoll";
	    TrackElemType[TrackElemType["MinigolfHoleA"] = 201] = "MinigolfHoleA";
	    TrackElemType[TrackElemType["MinigolfHoleB"] = 202] = "MinigolfHoleB";
	    TrackElemType[TrackElemType["MinigolfHoleC"] = 203] = "MinigolfHoleC";
	    TrackElemType[TrackElemType["MinigolfHoleD"] = 204] = "MinigolfHoleD";
	    TrackElemType[TrackElemType["MinigolfHoleE"] = 205] = "MinigolfHoleE";
	    TrackElemType[TrackElemType["MultiDimInvertedFlatToDown90QuarterLoop"] = 206] = "MultiDimInvertedFlatToDown90QuarterLoop";
	    TrackElemType[TrackElemType["Up90ToInvertedFlatQuarterLoop"] = 207] = "Up90ToInvertedFlatQuarterLoop";
	    TrackElemType[TrackElemType["InvertedFlatToDown90QuarterLoop"] = 208] = "InvertedFlatToDown90QuarterLoop";
	    TrackElemType[TrackElemType["LeftCurvedLiftHill"] = 209] = "LeftCurvedLiftHill";
	    TrackElemType[TrackElemType["RightCurvedLiftHill"] = 210] = "RightCurvedLiftHill";
	    TrackElemType[TrackElemType["LeftReverser"] = 211] = "LeftReverser";
	    TrackElemType[TrackElemType["RightReverser"] = 212] = "RightReverser";
	    TrackElemType[TrackElemType["AirThrustTopCap"] = 213] = "AirThrustTopCap";
	    TrackElemType[TrackElemType["AirThrustVerticalDown"] = 214] = "AirThrustVerticalDown";
	    TrackElemType[TrackElemType["AirThrustVerticalDownToLevel"] = 215] = "AirThrustVerticalDownToLevel";
	    TrackElemType[TrackElemType["BlockBrakes"] = 216] = "BlockBrakes";
	    TrackElemType[TrackElemType["LeftBankedQuarterTurn3TileUp25"] = 217] = "LeftBankedQuarterTurn3TileUp25";
	    TrackElemType[TrackElemType["RightBankedQuarterTurn3TileUp25"] = 218] = "RightBankedQuarterTurn3TileUp25";
	    TrackElemType[TrackElemType["LeftBankedQuarterTurn3TileDown25"] = 219] = "LeftBankedQuarterTurn3TileDown25";
	    TrackElemType[TrackElemType["RightBankedQuarterTurn3TileDown25"] = 220] = "RightBankedQuarterTurn3TileDown25";
	    TrackElemType[TrackElemType["LeftBankedQuarterTurn5TileUp25"] = 221] = "LeftBankedQuarterTurn5TileUp25";
	    TrackElemType[TrackElemType["RightBankedQuarterTurn5TileUp25"] = 222] = "RightBankedQuarterTurn5TileUp25";
	    TrackElemType[TrackElemType["LeftBankedQuarterTurn5TileDown25"] = 223] = "LeftBankedQuarterTurn5TileDown25";
	    TrackElemType[TrackElemType["RightBankedQuarterTurn5TileDown25"] = 224] = "RightBankedQuarterTurn5TileDown25";
	    TrackElemType[TrackElemType["Up25ToLeftBankedUp25"] = 225] = "Up25ToLeftBankedUp25";
	    TrackElemType[TrackElemType["Up25ToRightBankedUp25"] = 226] = "Up25ToRightBankedUp25";
	    TrackElemType[TrackElemType["LeftBankedUp25ToUp25"] = 227] = "LeftBankedUp25ToUp25";
	    TrackElemType[TrackElemType["RightBankedUp25ToUp25"] = 228] = "RightBankedUp25ToUp25";
	    TrackElemType[TrackElemType["Down25ToLeftBankedDown25"] = 229] = "Down25ToLeftBankedDown25";
	    TrackElemType[TrackElemType["Down25ToRightBankedDown25"] = 230] = "Down25ToRightBankedDown25";
	    TrackElemType[TrackElemType["LeftBankedDown25ToDown25"] = 231] = "LeftBankedDown25ToDown25";
	    TrackElemType[TrackElemType["RightBankedDown25ToDown25"] = 232] = "RightBankedDown25ToDown25";
	    TrackElemType[TrackElemType["LeftBankedFlatToLeftBankedUp25"] = 233] = "LeftBankedFlatToLeftBankedUp25";
	    TrackElemType[TrackElemType["RightBankedFlatToRightBankedUp25"] = 234] = "RightBankedFlatToRightBankedUp25";
	    TrackElemType[TrackElemType["LeftBankedUp25ToLeftBankedFlat"] = 235] = "LeftBankedUp25ToLeftBankedFlat";
	    TrackElemType[TrackElemType["RightBankedUp25ToRightBankedFlat"] = 236] = "RightBankedUp25ToRightBankedFlat";
	    TrackElemType[TrackElemType["LeftBankedFlatToLeftBankedDown25"] = 237] = "LeftBankedFlatToLeftBankedDown25";
	    TrackElemType[TrackElemType["RightBankedFlatToRightBankedDown25"] = 238] = "RightBankedFlatToRightBankedDown25";
	    TrackElemType[TrackElemType["LeftBankedDown25ToLeftBankedFlat"] = 239] = "LeftBankedDown25ToLeftBankedFlat";
	    TrackElemType[TrackElemType["RightBankedDown25ToRightBankedFlat"] = 240] = "RightBankedDown25ToRightBankedFlat";
	    TrackElemType[TrackElemType["FlatToLeftBankedUp25"] = 241] = "FlatToLeftBankedUp25";
	    TrackElemType[TrackElemType["FlatToRightBankedUp25"] = 242] = "FlatToRightBankedUp25";
	    TrackElemType[TrackElemType["LeftBankedUp25ToFlat"] = 243] = "LeftBankedUp25ToFlat";
	    TrackElemType[TrackElemType["RightBankedUp25ToFlat"] = 244] = "RightBankedUp25ToFlat";
	    TrackElemType[TrackElemType["FlatToLeftBankedDown25"] = 245] = "FlatToLeftBankedDown25";
	    TrackElemType[TrackElemType["FlatToRightBankedDown25"] = 246] = "FlatToRightBankedDown25";
	    TrackElemType[TrackElemType["LeftBankedDown25ToFlat"] = 247] = "LeftBankedDown25ToFlat";
	    TrackElemType[TrackElemType["RightBankedDown25ToFlat"] = 248] = "RightBankedDown25ToFlat";
	    TrackElemType[TrackElemType["LeftQuarterTurn1TileUp90"] = 249] = "LeftQuarterTurn1TileUp90";
	    TrackElemType[TrackElemType["RightQuarterTurn1TileUp90"] = 250] = "RightQuarterTurn1TileUp90";
	    TrackElemType[TrackElemType["LeftQuarterTurn1TileDown90"] = 251] = "LeftQuarterTurn1TileDown90";
	    TrackElemType[TrackElemType["RightQuarterTurn1TileDown90"] = 252] = "RightQuarterTurn1TileDown90";
	    TrackElemType[TrackElemType["MultiDimUp90ToInvertedFlatQuarterLoop"] = 253] = "MultiDimUp90ToInvertedFlatQuarterLoop";
	    TrackElemType[TrackElemType["MultiDimFlatToDown90QuarterLoop"] = 254] = "MultiDimFlatToDown90QuarterLoop";
	    TrackElemType[TrackElemType["MultiDimInvertedUp90ToFlatQuarterLoop"] = 255] = "MultiDimInvertedUp90ToFlatQuarterLoop";
	    TrackElemType[TrackElemType["RotationControlToggle"] = 256] = "RotationControlToggle";
	    TrackElemType[TrackElemType["FlatTrack1x4A"] = 257] = "FlatTrack1x4A";
	    TrackElemType[TrackElemType["FlatTrack2x2"] = 258] = "FlatTrack2x2";
	    TrackElemType[TrackElemType["FlatTrack4x4"] = 259] = "FlatTrack4x4";
	    TrackElemType[TrackElemType["FlatTrack2x4"] = 260] = "FlatTrack2x4";
	    TrackElemType[TrackElemType["FlatTrack1x5"] = 261] = "FlatTrack1x5";
	    TrackElemType[TrackElemType["FlatTrack1x1A"] = 262] = "FlatTrack1x1A";
	    TrackElemType[TrackElemType["FlatTrack1x4B"] = 263] = "FlatTrack1x4B";
	    TrackElemType[TrackElemType["FlatTrack1x1B"] = 264] = "FlatTrack1x1B";
	    TrackElemType[TrackElemType["FlatTrack1x4C"] = 265] = "FlatTrack1x4C";
	    TrackElemType[TrackElemType["FlatTrack3x3"] = 266] = "FlatTrack3x3";
	    TrackElemType[TrackElemType["Count"] = 267] = "Count";
	    TrackElemType[TrackElemType["None"] = 65535] = "None";
	    TrackElemType[TrackElemType["FlatTrack1x4A_Alias"] = 95] = "FlatTrack1x4A_Alias";
	    TrackElemType[TrackElemType["FlatTrack2x2_Alias"] = 110] = "FlatTrack2x2_Alias";
	    TrackElemType[TrackElemType["FlatTrack4x4_Alias"] = 111] = "FlatTrack4x4_Alias";
	    TrackElemType[TrackElemType["FlatTrack2x4_Alias"] = 115] = "FlatTrack2x4_Alias";
	    TrackElemType[TrackElemType["FlatTrack1x5_Alias"] = 116] = "FlatTrack1x5_Alias";
	    TrackElemType[TrackElemType["FlatTrack1x1A_Alias"] = 118] = "FlatTrack1x1A_Alias";
	    TrackElemType[TrackElemType["FlatTrack1x4B_Alias"] = 119] = "FlatTrack1x4B_Alias";
	    TrackElemType[TrackElemType["FlatTrack1x1B_Alias"] = 121] = "FlatTrack1x1B_Alias";
	    TrackElemType[TrackElemType["FlatTrack1x4C_Alias"] = 122] = "FlatTrack1x4C_Alias";
	    TrackElemType[TrackElemType["FlatTrack3x3_Alias"] = 123] = "FlatTrack3x3_Alias";
	})(TrackElemType || (TrackElemType = {}));
	var Unk9A37E4 = [
	    2147483647,
	    2106585154,
	    1985590284,
	    1636362342,
	    1127484953,
	    2106585154,
	    1985590284,
	    1636362342,
	    1127484953,
	    58579923,
	    0,
	    -555809667,
	    -1073741824,
	    -1518500249,
	    -1859775391,
	    -2074309916,
	    -2147483647,
	    58579923,
	    0,
	    -555809667,
	    -1073741824,
	    -1518500249,
	    -1859775391,
	    -2074309916,
	    1859775393,
	    1073741824,
	    0,
	    -1073741824,
	    -1859775393,
	    1859775393,
	    1073741824,
	    0,
	    -1073741824,
	    -1859775393,
	    1859775393,
	    1073741824,
	    0,
	    -1073741824,
	    -1859775393,
	    1859775393,
	    1073741824,
	    0,
	    -1073741824,
	    -1859775393,
	    2144540595,
	    2139311823,
	    2144540595,
	    2139311823,
	    2135719507,
	    2135719507,
	    2125953864,
	    2061796213,
	    1411702590,
	    2125953864,
	    2061796213,
	    1411702590,
	    1985590284,
	    1636362342,
	    1127484953,
	    2115506168,
	];
	var Unk9A39C4 = [
	    2147483647,
	    2096579710,
	    1946281152,
	    2096579710,
	    1946281152,
	    1380375879,
	    555809667,
	    -372906620,
	    -1231746017,
	    -1859775391,
	    1380375879,
	    555809667,
	    -372906620,
	    -1231746017,
	    -1859775391,
	    0,
	    2096579710,
	    1946281152,
	    2096579710,
	    1946281152,
	];

	var RideMeasurements = /** @class */ (function () {
	    function RideMeasurements() {
	        this.selectedRide = null;
	        this.maxLength = 0;
	        this.length = 0;
	        this.previousVerticalG = 0;
	        this.previousLateralG = 0;
	        this.maxVerticalPosG = 0;
	        this.maxVerticalNegG = 100;
	        this.maxLateralG = 0;
	    }
	    RideMeasurements.prototype.update = function () {
	        this.updateMeasurementsLength();
	        this.updateMeasurementsGForce();
	    };
	    RideMeasurements.prototype.updateMeasurementsLength = function () {
	        var car = this.currentFrontCar;
	        if (car == null)
	            return;
	        var acceleration = car.acceleration;
	        var velocity = car.velocity;
	        var result = Math.abs(((velocity + acceleration) >> 10) * 42);
	        if (car.status == "waiting_to_depart") {
	            this.length = 0;
	        }
	        this.length += result;
	        if (this.length > this.maxLength) {
	            this.maxLength = this.length;
	        }
	    };
	    RideMeasurements.prototype.updateMeasurementsGForce = function () {
	        var _this = this;
	        var car = this.currentFrontCar;
	        if (car == null)
	            return;
	        var tile = map.getTile(car.x / 32, car.y / 32);
	        var trackElement = tile.elements.filter(function (element) {
	            var _a;
	            return element.type == "track" && element.ride == ((_a = _this.selectedRide) === null || _a === void 0 ? void 0 : _a.id);
	        })[0];
	        var gForces = getGForces(trackElement.trackType, car.spriteType, car.bankRotation, car.trackProgress, car.velocity);
	        var verticalG = gForces.gForceVert + this.previousVerticalG;
	        var lateralG = gForces.gForceLateral + this.previousLateralG;
	        verticalG /= 2;
	        lateralG /= 2;
	        this.previousVerticalG = verticalG;
	        this.previousLateralG = lateralG;
	        /*
	        if (gForces.VerticalG <= 0) {
	            curRide -> total_air_time++
	        }
	        */
	        if (verticalG > this.maxVerticalPosG)
	            this.maxVerticalPosG = verticalG;
	        if (verticalG < this.maxVerticalNegG)
	            this.maxVerticalNegG = verticalG;
	        if (Math.abs(lateralG) > this.maxLateralG)
	            this.maxLateralG = Math.abs(lateralG);
	    };
	    RideMeasurements.prototype.selectRide = function (index) {
	        this.selectedRide = this.rides[index];
	        this.reset();
	    };
	    RideMeasurements.prototype.reset = function () {
	        this.maxLength = 0;
	        this.length = 0;
	        this.previousVerticalG = 0;
	        this.previousLateralG = 0;
	        this.maxVerticalPosG = 0;
	        this.maxVerticalNegG = 100;
	        this.maxLateralG = 0;
	    };
	    Object.defineProperty(RideMeasurements.prototype, "rides", {
	        get: function () {
	            return map.rides.filter(function (ride) { return ride.classification == "ride"; });
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(RideMeasurements.prototype, "rideNames", {
	        get: function () {
	            return this.rides.map(function (ride) { return ride.name; });
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(RideMeasurements.prototype, "currentFrontCar", {
	        get: function () {
	            if (this.selectedRide == null)
	                return null;
	            var vehicleId = this.selectedRide.vehicles[0];
	            if (vehicleId != 0 && !vehicleId)
	                return null;
	            var cars = map.getAllEntities("car");
	            if (cars.length == 0)
	                return null;
	            return cars.filter(function (car) { return car.id == vehicleId; })[0];
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return RideMeasurements;
	}());

	/* eslint-disable indent */
	var windowWidth = 210;
	var windowHeight = 200;
	var Measurements;
	(function (Measurements) {
	    Measurements[Measurements["excitment"] = 0] = "excitment";
	    Measurements[Measurements["intensity"] = 1] = "intensity";
	    Measurements[Measurements["nausea"] = 2] = "nausea";
	    Measurements[Measurements["maxSpeed"] = 3] = "maxSpeed";
	    Measurements[Measurements["averageSpeed"] = 4] = "averageSpeed";
	    Measurements[Measurements["rideTime"] = 5] = "rideTime";
	    Measurements[Measurements["rideLength"] = 6] = "rideLength";
	    Measurements[Measurements["positiveGs"] = 7] = "positiveGs";
	    Measurements[Measurements["negativeGs"] = 8] = "negativeGs";
	    Measurements[Measurements["lateralGs"] = 9] = "lateralGs";
	    Measurements[Measurements["airTime"] = 10] = "airTime";
	    Measurements[Measurements["drops"] = 11] = "drops";
	    Measurements[Measurements["highestDrop"] = 12] = "highestDrop";
	})(Measurements || (Measurements = {}));
	function getName(type) {
	    switch (type) {
	        case Measurements.excitment:
	            return "Excitement rating";
	        case Measurements.intensity:
	            return "Intensity rating";
	        case Measurements.nausea:
	            return "Nausea rating";
	        case Measurements.maxSpeed:
	            return "Max. speed";
	        case Measurements.averageSpeed:
	            return "Average speed";
	        case Measurements.rideTime:
	            return "Ride time";
	        case Measurements.rideLength:
	            return "Ride length";
	        case Measurements.positiveGs:
	            return "Max. positive vertical Gs";
	        case Measurements.negativeGs:
	            return "Max. negative vertical Gs";
	        case Measurements.lateralGs:
	            return "Max. lateral Gs";
	        case Measurements.airTime:
	            return "Total ‘air’ time";
	        case Measurements.drops:
	            return "Drops";
	        case Measurements.highestDrop:
	            return "Highest drop height";
	    }
	}
	function getIndex(type) {
	    switch (type) {
	        case Measurements.excitment:
	            return 0;
	        case Measurements.intensity:
	            return 1;
	        case Measurements.nausea:
	            return 2;
	        case Measurements.maxSpeed:
	            return 4;
	        case Measurements.averageSpeed:
	            return 5;
	        case Measurements.rideTime:
	            return 6;
	        case Measurements.rideLength:
	            return 7;
	        case Measurements.positiveGs:
	            return 8;
	        case Measurements.negativeGs:
	            return 9;
	        case Measurements.lateralGs:
	            return 10;
	        case Measurements.airTime:
	            return 11;
	        case Measurements.drops:
	            return 12;
	        case Measurements.highestDrop:
	            return 13;
	    }
	}
	var RideMeasurementsWindow = /** @class */ (function () {
	    function RideMeasurementsWindow() {
	        this.uiWindow = null;
	        this.dropdownHeadline = ["Select a ride"];
	    }
	    Object.defineProperty(RideMeasurementsWindow.prototype, "rideSelectionWidget", {
	        get: function () {
	            var _a;
	            return (_a = this.uiWindow) === null || _a === void 0 ? void 0 : _a.findWidget("ride_selection");
	        },
	        enumerable: false,
	        configurable: true
	    });
	    RideMeasurementsWindow.prototype.getLabelWidget = function (type) {
	        var _a;
	        return (_a = this.uiWindow) === null || _a === void 0 ? void 0 : _a.findWidget(type.toString());
	    };
	    RideMeasurementsWindow.prototype.setValue = function (type, text) {
	        var _a;
	        var label = (_a = this.uiWindow) === null || _a === void 0 ? void 0 : _a.findWidget(type.toString() + "-value");
	        label.text = text;
	    };
	    Object.defineProperty(RideMeasurementsWindow.prototype, "dropdownContent", {
	        set: function (content) {
	            this.rideSelectionWidget.items = this.dropdownHeadline.concat(content);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    RideMeasurementsWindow.prototype.open = function (onClose, onSelectRide) {
	        this.uiWindow = ui.openWindow({
	            classification: "my.window",
	            width: windowWidth,
	            height: windowHeight,
	            title: "Ride length preview",
	            onClose: onClose,
	            widgets: [
	                {
	                    name: "ride_selection",
	                    width: windowWidth - 10,
	                    height: 20,
	                    x: 5,
	                    y: 20,
	                    type: "dropdown",
	                    items: this.dropdownHeadline,
	                    selectedIndex: 0,
	                    onChange: onSelectRide
	                },
	                this.label(Measurements.excitment),
	                this.value(Measurements.excitment),
	                this.label(Measurements.intensity),
	                this.value(Measurements.intensity),
	                this.label(Measurements.nausea),
	                this.value(Measurements.nausea),
	                this.label(Measurements.maxSpeed),
	                this.value(Measurements.maxSpeed),
	                this.label(Measurements.averageSpeed),
	                this.value(Measurements.averageSpeed),
	                this.label(Measurements.rideTime),
	                this.value(Measurements.rideTime),
	                this.label(Measurements.rideLength),
	                this.value(Measurements.rideLength),
	                this.label(Measurements.positiveGs),
	                this.value(Measurements.positiveGs),
	                this.label(Measurements.negativeGs),
	                this.value(Measurements.negativeGs),
	                this.label(Measurements.lateralGs),
	                this.value(Measurements.lateralGs),
	                this.label(Measurements.airTime),
	                this.value(Measurements.airTime),
	                this.label(Measurements.drops),
	                this.value(Measurements.drops),
	                this.label(Measurements.highestDrop),
	                this.value(Measurements.highestDrop),
	            ]
	        });
	    };
	    RideMeasurementsWindow.prototype.label = function (type) {
	        return {
	            name: type.toString(),
	            type: "label",
	            width: 145,
	            height: 20,
	            x: 5,
	            y: 50 + 10 * getIndex(type),
	            text: getName(type) + ":"
	        };
	    };
	    RideMeasurementsWindow.prototype.value = function (type) {
	        return {
	            name: type.toString() + "-value",
	            type: "label",
	            width: windowWidth - 10,
	            height: 20,
	            x: 150,
	            y: 50 + 10 * getIndex(type),
	            text: "-"
	        };
	    };
	    return RideMeasurementsWindow;
	}());

	registerPlugin({
	    name: "Ride Info",
	    version: "1.0",
	    authors: ["Felix Janus"],
	    licence: "MIT",
	    type: "local",
	    main: function () {
	        ui.registerMenuItem("Ride length", function () {
	            openRideMeasurementsWindow();
	        });
	        console.clear();
	        ui.closeAllWindows();
	        openRideMeasurementsWindow();
	    }
	});
	function openRideMeasurementsWindow() {
	    var rideMeasurementsWindow = new RideMeasurementsWindow();
	    var rideMeasurements = new RideMeasurements();
	    var rideNames = rideMeasurements.rideNames;
	    var tickHook = context.subscribe("interval.tick", function () {
	        if (rideMeasurements.selectedRide == null)
	            return;
	        var car = rideMeasurements.currentFrontCar;
	        if (car == null)
	            return;
	        rideMeasurements.update();
	        rideMeasurementsWindow.setValue(Measurements.rideLength, (rideMeasurements.maxLength >> 16) + "m");
	        rideMeasurementsWindow.setValue(Measurements.positiveGs, (rideMeasurements.maxVerticalPosG / 100).toFixed(2) + "g");
	        rideMeasurementsWindow.setValue(Measurements.negativeGs, (rideMeasurements.maxVerticalNegG / 100).toFixed(2) + "g");
	        rideMeasurementsWindow.setValue(Measurements.lateralGs, (rideMeasurements.maxLateralG / 100).toFixed(2) + "g");
	    });
	    rideMeasurementsWindow.open(tickHook.dispose, function (index) {
	        rideMeasurements.selectRide(index - 1);
	    });
	    rideMeasurementsWindow.dropdownContent = rideNames;
	}

}());
