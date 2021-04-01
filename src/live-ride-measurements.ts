import { RideMeasurements } from "./ride-measurements"
import { Measurements, RideMeasurementsWindow } from "./ride-measurements-window"

// TODO:
// Doesn't support rides with multiple stations

registerPlugin({
    name: "Live Ride Measurements",
    version: "0.3.3",
    authors: ["Felix Janus"],
    licence: "MIT",
    type: "remote",
    minApiVersion: 24,
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
    rideMeasurementsWindow.onReset = () => rideMeasurements.reset()

    const rideNames = rideMeasurements.rideNames


    const tickHook = context.subscribe("interval.tick", () => {
        if (rideMeasurements.selectedRide == null) {
            rideMeasurementsWindow.hideValues()
            rideMeasurementsWindow.hideHint()
            return
        }

        const cars = rideMeasurements.rideCars
        if (cars == null || cars.length == 0) {
            rideMeasurementsWindow.hideValues()
            rideMeasurementsWindow.showHint("Please enable ghost trains.")
            return
        }
        rideMeasurementsWindow.showValues()
        rideMeasurementsWindow.hideHint()

        const firstCar = cars[0]
        rideMeasurementsWindow.viewportWidget?.viewport?.moveTo({
            x: firstCar.x,
            y: firstCar.y,
            z: firstCar.z
        })

        rideMeasurements.resetValuesOnNewCircuit = rideMeasurementsWindow.autoResetValues
        rideMeasurements.update()

        /*
        if (rideMeasurements.selectedRide != null) {
            rideMeasurementsWindow.setValue(Measurements.excitment, (rideMeasurements.selectedRide.excitement / 100).toFixed(2).toString())
            rideMeasurementsWindow.setValue(Measurements.intensity, (rideMeasurements.selectedRide.intensity / 100).toFixed(2).toString())
            rideMeasurementsWindow.setValue(Measurements.nausea, (rideMeasurements.selectedRide.nausea / 100).toFixed(2).toString())
        }
        */

        rideMeasurementsWindow.setValue(Measurements.currentSpeed, formatSpeed((rideMeasurements.currentSpeed * 9) >> 18))
        rideMeasurementsWindow.setValue(Measurements.maxSpeed, formatSpeed((rideMeasurements.maxSpeed.value * 9) >> 18))
        rideMeasurementsWindow.setValue(Measurements.rideLength, formatDistance(rideMeasurements.maxLength.value >> 16))
        rideMeasurementsWindow.setValue(Measurements.positiveGs, (rideMeasurements.maxVerticalPosG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.negativeGs, (rideMeasurements.maxVerticalNegG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.lateralGs, (rideMeasurements.maxLateralG.value / 100).toFixed(2) + " g")
        rideMeasurementsWindow.setValue(Measurements.airTime, (rideMeasurements.totalAirTime.value * 3 / 100).toFixed(2) + " secs")
        rideMeasurementsWindow.setValue(Measurements.averageSpeed, formatSpeed(((rideMeasurements.averageSpeed.value / rideMeasurements.time.value) * 9) >> 18))
        rideMeasurementsWindow.setValue(Measurements.rideTime, (rideMeasurements.time.value) + " secs")
    })

    rideMeasurementsWindow.open(() => {
        rideMeasurements.selectRide(null)
        tickHook.dispose()
    }, (index) => {
        rideMeasurements.selectRide(index - 1)
    })
    rideMeasurementsWindow.dropdownContent = rideNames

    function formatDistance(metres: number): string {
        if (rideMeasurementsWindow.useImperial) {
            return Math.floor((metres * 840) / 256) + " ft"
        }
        return metres + " m"
    }

    function formatSpeed(mph: number): string {
        if (rideMeasurementsWindow.useImperial) {
            return mph + " mph"
        }
        return ((mph * 1648) >> 10) + " km/h"
    }
}
