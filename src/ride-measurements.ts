import { getGForces } from "./native-calculations";

export class RideMeasurements {
    selectedRide: Ride | null = null;
    maxLength = 0;
    length = 0;
    previousVerticalG = 0;
    previousLateralG = 0;
    maxVerticalPosG = 0;
    maxVerticalNegG = 100;
    maxLateralG = 0;

    update(): void {
        this.updateMeasurementsLength();
        this.updateMeasurementsGForce();
    }

    updateMeasurementsLength(): void {
        const car = this.currentFrontCar
        if (car == null)
            return;

        const acceleration = car.acceleration;
        const velocity = car.velocity;
        const result = Math.abs(((velocity + acceleration) >> 10) * 42);

        if (car.status == "waiting_to_depart") {
            this.length = 0;
        }

        this.length += result;
        if (this.length > this.maxLength) {
            this.maxLength = this.length;
        }
    }

    updateMeasurementsGForce(): void {
        const car = this.currentFrontCar
        if (car == null)
            return;

        const tile = map.getTile(car.x / 32, car.y / 32);
        const trackElement = tile.elements.filter((element) => {
            return element.type == "track" && (element as TrackElement).ride == this.selectedRide?.id;
        })[0] as TrackElement;

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
    }

    selectRide(index: number): void {
        this.selectedRide = this.rides[index];
        this.reset()
    }

    reset(): void {
        this.maxLength = 0;
        this.length = 0;
        this.previousVerticalG = 0;
        this.previousLateralG = 0;
        this.maxVerticalPosG = 0;
        this.maxVerticalNegG = 100;
        this.maxLateralG = 0;
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
