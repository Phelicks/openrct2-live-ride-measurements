import { RideMeasurements } from "./ride-measurements"
import { Measurements, RideMeasurementsWindow } from "./ride-measurements-window"

// Doesn't support rides with multiple stations
// G calculation is off
// Ghost trains need to be enabled

registerPlugin({
    name: "Ride Info",
    version: "1.0",
    authors: ["Felix Janus"],
    licence: "MIT",
    type: "local",
    main: () => {

        ui.registerMenuItem("Ride length", () => {
            openRideMeasurementsWindow()
        })

        console.clear()
        ui.closeAllWindows()
        openRideMeasurementsWindow()
    }
})

function openRideMeasurementsWindow() {
    const rideMeasurementsWindow = new RideMeasurementsWindow()
    const rideMeasurements = new RideMeasurements()
    const rideNames = rideMeasurements.rideNames;


    const tickHook = context.subscribe("interval.tick", () => {
        if (rideMeasurements.selectedRide == null)
            return

        const car = rideMeasurements.currentFrontCar
        if (car == null)
            return

        rideMeasurements.update()

        rideMeasurementsWindow.setValue(Measurements.maxSpeed, mphToKmph((rideMeasurements.maxSpeed.value * 9) >> 18) + " km/h")
        rideMeasurementsWindow.setValue(Measurements.rideLength, (rideMeasurements.maxLength.value >> 16) + " m")
        rideMeasurementsWindow.setValue(Measurements.positiveGs, (rideMeasurements.maxVerticalPosG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.negativeGs, (rideMeasurements.maxVerticalNegG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.lateralGs, (rideMeasurements.maxLateralG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.airTime, (rideMeasurements.totalAirTime.value * 3 / 100).toFixed(2) + " secs")
        rideMeasurementsWindow.setValue(Measurements.averageSpeed, mphToKmph(((rideMeasurements.averageSpeed.value / rideMeasurements.time.value) * 9) >> 18) + " km/h")
        rideMeasurementsWindow.setValue(Measurements.rideTime, (rideMeasurements.time.value) + " secs")
    })

    rideMeasurementsWindow.open(tickHook.dispose, (index) => {
        rideMeasurements.selectRide(index - 1)
    });
    rideMeasurementsWindow.dropdownContent = rideNames
}

const mphToKmph = (mph: number) => (mph * 1648) >> 10;