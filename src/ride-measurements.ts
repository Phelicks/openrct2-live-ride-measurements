enum BlockSectionStatus {
    traveling, inStation, inBlockBreak, inChainLift
}

export class RideMeasurements {
    private previousVerticalG = 0
    private previousLateralG = 0
    private averageSpeedTestTimeout = 0
    private lastCarStatus?: string
    private blockSectionCount = 0
    private blockSectionStatus: BlockSectionStatus | undefined
    private blockSectionTiming: number[] | undefined

    blockSectionText = "Waiting for station..."

    resetValuesOnNewCircuit = false
    selectedRide: Ride | null = null
    currentSpeed = 0
    maxLength = new MaxValue()
    maxVerticalPosG = new MaxValue()
    maxVerticalNegG = new MinValue(100)
    maxLateralG = new MaxValue()
    totalAirTime = new MaxValue()
    maxSpeed = new MaxValue()
    averageSpeed = new MaxValue()
    time = new MaxValue()

    update(car: Car | null): void {
        if (car == null)
            return

        if (car.status == "waiting_to_depart" && car.status != this.lastCarStatus) {
            if (this.resetValuesOnNewCircuit) {
                this.reset()
            } else {
                this.newCircuit()
            }
        }
        this.lastCarStatus = car.status
        
        this.updateMeasurementsLength(car)
        this.updateMeasurementsGForce(car)
        this.updateBlockSectionTiming(car)
    }

    updateMeasurementsLength(car: Car): void {
        const acceleration = car.acceleration
        const velocity = car.velocity
        const result = Math.abs(((velocity + acceleration) >> 10) * 42)

        this.maxLength.current += result
    }

    updateBlockSectionTiming(car: Car): void {
        const blockBreakTrackType = 216
        const tile = map.getTile(car.x/32, car.y/32)

        for (const element of tile.elements) {
            if (element.type != "track") continue
            if (element.ride != car.ride) continue
            if (element.baseZ != car.trackLocation.z) continue

            const track = element as TrackElement

            if (car.status == "waiting_to_depart") {
                if (this.blockSectionStatus != BlockSectionStatus.inStation) {
                    if (this.blockSectionCount > 0 && this.blockSectionTiming) {
                        // this.blockSectionTiming.push(Date.now())
                        // console.log("Total block section count: " + this.blockSectionCount)
                    }
                    // console.log("Found station.")
                    this.blockSectionCount = 1
                }
                this.blockSectionStatus = BlockSectionStatus.inStation
            }
            else if (track.trackType == blockBreakTrackType) {
                if (this.blockSectionStatus != BlockSectionStatus.inBlockBreak && this.blockSectionTiming) {
                    // console.log("found block break")
                    this.blockSectionCount++
                }
                this.blockSectionStatus = BlockSectionStatus.inBlockBreak
            }
            else if (track.hasChainLift || track.hasCableLift) {
                if (this.blockSectionStatus != BlockSectionStatus.inChainLift && this.blockSectionTiming) {
                    // console.log("chain")
                    this.blockSectionCount++
                }
                this.blockSectionStatus = BlockSectionStatus.inChainLift
            }
            else {
                if (this.blockSectionStatus == BlockSectionStatus.inStation) {
                    this.blockSectionTiming = [Date.now()]
                }
                else if (this.blockSectionStatus != BlockSectionStatus.traveling) {
                    if (this.blockSectionTiming) {
                        // console.log("Time section.")
                        this.blockSectionTiming.push(Date.now())
                    }
                }
                this.blockSectionStatus = BlockSectionStatus.traveling
            }
        }

        if (this.blockSectionTiming) {
            this.blockSectionText = ""

            var lastTime: number | undefined
            var round = 1
            for (const time of [...this.blockSectionTiming, Date.now()]) {
                if (!lastTime) {
                    lastTime = time
                    continue
                }
                const text = "Block " + round++ + ": " + ((time - lastTime) / 1000)
                this.blockSectionText += text + "\n"
                lastTime = time
            }
        }
    }

    updateMeasurementsGForce(car: Car): void {
        this.currentSpeed = car.velocity

        if (this.maxSpeed.current <= car.velocity) {
            this.maxSpeed.current = car.velocity
        }

        this.averageSpeedTestTimeout++
        if (this.averageSpeedTestTimeout >= 32)
            this.averageSpeedTestTimeout = 0

        if (this.averageSpeedTestTimeout == 0 && Math.abs(car.velocity) > 0x8000) {
            this.averageSpeed.current = this.averageSpeed.current + Math.abs(car.velocity)
            this.time.current++
        }

        const gForces = {
            gForceVert: car.gForces.verticalG,
            gForceLateral: car.gForces.lateralG,
        }


        let verticalG = gForces.gForceVert + this.previousVerticalG
        let lateralG = gForces.gForceLateral + this.previousLateralG
        verticalG /= 2
        lateralG /= 2

        this.previousVerticalG = verticalG
        this.previousLateralG = lateralG

        if ((verticalG & 0xFFFFFFFF) <= 0) {
            this.totalAirTime.current++
        }

        if (verticalG > this.maxVerticalPosG.current) {
            this.maxVerticalPosG.current = verticalG
        }

        if (verticalG < this.maxVerticalNegG.current) {
            this.maxVerticalNegG.current = verticalG
        }

        if (Math.abs(lateralG) > this.maxLateralG.current) {
            this.maxLateralG.current = Math.abs(lateralG)
        }
    }

    selectRide(index: number | null): void {
        if (index == null) {
            this.selectedRide = null
            return
        }
        this.selectedRide = this.rides[index]
        this.reset()
    }

    newCircuit(): void {
        this.previousVerticalG = 0
        this.previousLateralG = 0
        this.averageSpeedTestTimeout = 0
        this.maxLength.push()
        this.maxVerticalPosG.push()
        this.maxVerticalNegG.push()
        this.maxLateralG.push()
        this.totalAirTime.push()
        this.maxSpeed.push()
        this.averageSpeed.push()
        this.time.push()
    }

    reset(): void {
        this.previousVerticalG = 0
        this.previousLateralG = 0
        this.averageSpeedTestTimeout = 0
        this.maxLength.reset()
        this.maxVerticalPosG.reset()
        this.maxVerticalNegG.reset()
        this.maxLateralG.reset()
        this.totalAirTime.reset()
        this.maxSpeed.reset()
        this.averageSpeed.reset()
        this.time.reset()

        this.blockSectionCount = 0
        this.blockSectionStatus = undefined
        this.blockSectionTiming = undefined
        this.blockSectionText = "Waiting for station..."
    }

    get rides(): Ride[] {
        return map.rides.filter((ride) => ride.classification == "ride")
    }

    get rideNames(): string[] {
        return this.rides.map((ride) => ride.name)
    }

    get headCar(): Car | null {
        if (this.selectedRide == null)
            return null

        const vehicleId = this.selectedRide.vehicles[0]

        if (vehicleId != 0 && !vehicleId)
            return null

        return map.getEntity(vehicleId) as Car | null;
    }
}

class MaxValue {
    private initialValue: number
    last: number
    current: number

    get value() { return Math.max(this.current, this.last) }

    constructor(value?: number) {
        this.initialValue = value || 0
        this.current = value || 0
        this.last = value || 0
    }

    push() {
        this.last = this.current
        this.current = this.initialValue
    }

    reset() {
        this.last = this.initialValue
        this.current = this.initialValue
    }
}

class MinValue {
    private initialValue: number
    last: number
    current: number

    get value() { return Math.min(this.current, this.last) }

    constructor(value?: number) {
        this.initialValue = value || 0
        this.current = value || 0
        this.last = value || 0
    }

    push() {
        this.last = this.current
        this.current = this.initialValue
    }

    reset() {
        this.last = this.initialValue
        this.current = this.initialValue
    }
}