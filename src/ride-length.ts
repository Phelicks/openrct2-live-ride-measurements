import { RideMeasurements } from "./ride-measurements"
import { Measurements, RideMeasurementsWindow } from "./ride-measurements-window"

// TODO:
// Doesn't support rides with multiple stations
// Show imperial measurements
// Add Reset Button

registerPlugin({
    name: "Live Ride Measurements",
    version: "1.0.0",
    authors: ["Felix Janus"],
    licence: "MIT",
    type: "remote",
    minApiVersion: 1,
    main: () => {

        if (!ui) {
            return
        }

        ui.registerMenuItem("Live Ride Measurements", () => {
            openRideMeasurementsWindow()
        })

        // console.clear()
        // ui.closeAllWindows()
        // openRideMeasurementsWindow()
    }
})

function openRideMeasurementsWindow() {
    const rideMeasurementsWindow = new RideMeasurementsWindow()
    const rideMeasurements = new RideMeasurements()
    const rideNames = rideMeasurements.rideNames;


    const tickHook = context.subscribe("interval.tick", () => {
        if (rideMeasurements.selectedRide == null) {
            rideMeasurementsWindow.hideValues()
            rideMeasurementsWindow.hideHint()
            return
        }

        const cars = rideMeasurements.getRideCars
        if (cars == null || cars.length == 0) {
            rideMeasurementsWindow.hideValues()
            rideMeasurementsWindow.showHint("Please enable ghost trains.")
            return
        }
        rideMeasurementsWindow.showValues()
        rideMeasurementsWindow.hideHint()

        rideMeasurements.update()

        if (rideMeasurements.selectedRide != null) {
            rideMeasurementsWindow.setValue(Measurements.excitment, (rideMeasurements.selectedRide.excitement / 100).toFixed(2).toString())
            rideMeasurementsWindow.setValue(Measurements.intensity, (rideMeasurements.selectedRide.intensity / 100).toFixed(2).toString())
            rideMeasurementsWindow.setValue(Measurements.nausea, (rideMeasurements.selectedRide.nausea / 100).toFixed(2).toString())
        }

        rideMeasurementsWindow.setValue(Measurements.maxSpeed, mphToKmph((rideMeasurements.maxSpeed.value * 9) >> 18) + " km/h")
        rideMeasurementsWindow.setValue(Measurements.rideLength, (rideMeasurements.maxLength.value >> 16) + " m")
        rideMeasurementsWindow.setValue(Measurements.positiveGs, (rideMeasurements.maxVerticalPosG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.negativeGs, (rideMeasurements.maxVerticalNegG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.lateralGs, (rideMeasurements.maxLateralG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.airTime, (rideMeasurements.totalAirTime.value * 3 / 100).toFixed(2) + " secs")
        rideMeasurementsWindow.setValue(Measurements.averageSpeed, mphToKmph(((rideMeasurements.averageSpeed.value / rideMeasurements.time.value) * 9) >> 18) + " km/h")
        rideMeasurementsWindow.setValue(Measurements.rideTime, (rideMeasurements.time.value) + " secs")
    })

    rideMeasurementsWindow.open(() => {
        rideMeasurements.selectRide(null);
        tickHook.dispose();
    }, (index) => {
        rideMeasurements.selectRide(index - 1)
    });
    rideMeasurementsWindow.dropdownContent = rideNames
}

const mphToKmph = (mph: number) => (mph * 1648) >> 10;