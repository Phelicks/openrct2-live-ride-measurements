import { RideMeasurements } from "./ride-measurements"
import { Measurements, RideMeasurementsWindow } from "./ride-measurements-window"

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

        rideMeasurementsWindow.setValue(Measurements.rideLength, (rideMeasurements.maxLength >> 16) + "m")
        rideMeasurementsWindow.setValue(Measurements.positiveGs, (rideMeasurements.maxVerticalPosG / 100).toFixed(2) + "g")
        rideMeasurementsWindow.setValue(Measurements.negativeGs, (rideMeasurements.maxVerticalNegG / 100).toFixed(2) + "g")
        rideMeasurementsWindow.setValue(Measurements.lateralGs, (rideMeasurements.maxLateralG / 100).toFixed(2) + "g")
    })

    rideMeasurementsWindow.open(tickHook.dispose, (index) => {
        rideMeasurements.selectRide(index - 1)
    });
    rideMeasurementsWindow.dropdownContent = rideNames
}