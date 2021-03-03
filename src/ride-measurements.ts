import { getGForces } from "./native-calculations";



export class RideMeasurements {
    private previousVerticalG = 0;
    private previousLateralG = 0;
    private averageSpeedTestTimeout = 0;
    private lastCarStatus?: string;

    selectedRide: Ride | null = null;
    maxLength = new MaxValue();
    maxVerticalPosG = new MaxValue();
    maxVerticalNegG = new MinValue(100);
    maxLateralG = new MaxValue();
    totalAirTime = new MaxValue();
    maxSpeed = new MaxValue();
    averageSpeed = new MaxValue();
    time = new MaxValue();

    update(): void {
        const car = this.currentFrontCar
        if (car == null)
            return;

        if (car.status == "waiting_to_depart" && car.status != this.lastCarStatus) {
            this.newRound()
        }
        this.lastCarStatus = car.status

        this.updateMeasurementsLength(car);
        this.updateMeasurementsGForce(car);
    }

    updateMeasurementsLength(car: Car): void {
        const acceleration = car.acceleration;
        const velocity = car.velocity;
        const result = Math.abs(((velocity + acceleration) >> 10) * 42);

        this.maxLength.current += result;
    }

    updateMeasurementsGForce(car: Car): void {
        const tile = map.getTile(car.x / 32, car.y / 32);
        const trackElement = tile.elements.filter((element) => {
            return element.type == "track" && (element as TrackElement).ride == this.selectedRide?.id;
        })[0] as TrackElement;

        if (this.maxSpeed.current <= car.velocity) {
            this.maxSpeed.current = car.velocity
        }

        this.averageSpeedTestTimeout++;
        if (this.averageSpeedTestTimeout >= 32)
            this.averageSpeedTestTimeout = 0;

        if (this.averageSpeedTestTimeout == 0 && Math.abs(car.velocity) > 0x8000) {
            this.averageSpeed.current = this.averageSpeed.current + Math.abs(car.velocity)
            this.time.current++
        }

        const gForces = getGForces(
            trackElement.trackType,
            car.spriteType,
            car.bankRotation,
            car.trackProgress,
            car.velocity
        );

        let verticalG = gForces.gForceVert + this.previousVerticalG;
        let lateralG = gForces.gForceLateral + this.previousLateralG;
        verticalG /= 2;
        lateralG /= 2;

        this.previousVerticalG = verticalG;
        this.previousLateralG = lateralG;


        if (verticalG <= 0) {
            this.totalAirTime.current++
        }

        if (verticalG > this.maxVerticalPosG.current) {
            this.maxVerticalPosG.current = verticalG;
        }

        if (verticalG < this.maxVerticalNegG.current) {
            this.maxVerticalNegG.current = verticalG;
        }

        if (Math.abs(lateralG) > this.maxLateralG.current) {
            this.maxLateralG.current = Math.abs(lateralG);
        }
    }

    selectRide(index: number): void {
        this.selectedRide = this.rides[index];
        this.reset()
    }

    newRound(): void {
        this.previousVerticalG = 0;
        this.previousLateralG = 0;
        this.averageSpeedTestTimeout = 0;
        this.maxLength.push();
        this.maxVerticalPosG.push();
        this.maxVerticalNegG.push();
        this.maxLateralG.push();
        this.totalAirTime.push();
        this.maxSpeed.push();
        this.averageSpeed.push();
        this.time.push();
    }

    reset(): void {
        this.previousVerticalG = 0;
        this.previousLateralG = 0;
        this.averageSpeedTestTimeout = 0;
        this.maxLength.reset();
        this.maxVerticalPosG.reset();
        this.maxVerticalNegG.reset();
        this.maxLateralG.reset();
        this.totalAirTime.reset();
        this.maxSpeed.reset();
        this.averageSpeed.reset();
        this.time.reset();
    }

    get rides(): Ride[] {
        return map.rides.filter((ride) => ride.classification == "ride");
    }

    get rideNames(): string[] {
        return this.rides.map((ride) => ride.name);
    }

    get currentFrontCar(): Car | null {
        if (this.selectedRide == null)
            return null;

        const vehicleId = this.selectedRide.vehicles[0];

        if (vehicleId != 0 && !vehicleId)
            return null;

        const cars = map.getAllEntities("car");

        if (cars.length == 0)
            return null;

        return cars.filter((car) => car.id == vehicleId)[0] as Car;
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