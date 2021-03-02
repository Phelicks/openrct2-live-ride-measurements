/* eslint-disable indent */
const windowWidth = 210
const windowHeight = 200

export enum Measurements {
    excitment = 0,
    intensity = 1,
    nausea = 2,
    maxSpeed = 3,
    averageSpeed = 4,
    rideTime = 5,
    rideLength = 6,
    positiveGs = 7,
    negativeGs = 8,
    lateralGs = 9,
    airTime = 10,
    drops = 11,
    highestDrop = 12,
}

function getName(type: Measurements): string {
    switch (type) {
        case Measurements.excitment:
            return "Excitement rating"
        case Measurements.intensity:
            return "Intensity rating"
        case Measurements.nausea:
            return "Nausea rating"
        case Measurements.maxSpeed:
            return "Max. speed"
        case Measurements.averageSpeed:
            return "Average speed"
        case Measurements.rideTime:
            return "Ride time"
        case Measurements.rideLength:
            return "Ride length"
        case Measurements.positiveGs:
            return "Max. positive vertical Gs"
        case Measurements.negativeGs:
            return "Max. negative vertical Gs"
        case Measurements.lateralGs:
            return "Max. lateral Gs"
        case Measurements.airTime:
            return "Total ‘air’ time"
        case Measurements.drops:
            return "Drops"
        case Measurements.highestDrop:
            return "Highest drop height"
    }
}

function getIndex(type: Measurements): number {
    switch (type) {
        case Measurements.excitment:
            return 0
        case Measurements.intensity:
            return 1
        case Measurements.nausea:
            return 2
        case Measurements.maxSpeed:
            return 4
        case Measurements.averageSpeed:
            return 5
        case Measurements.rideTime:
            return 6
        case Measurements.rideLength:
            return 7
        case Measurements.positiveGs:
            return 8
        case Measurements.negativeGs:
            return 9
        case Measurements.lateralGs:
            return 10
        case Measurements.airTime:
            return 11
        case Measurements.drops:
            return 12
        case Measurements.highestDrop:
            return 13
    }
}

export class RideMeasurementsWindow {
    uiWindow: Window | null = null;
    dropdownHeadline = ["Select a ride"];

    get rideSelectionWidget(): DropdownWidget {
        return this.uiWindow?.findWidget("ride_selection") as DropdownWidget;
    }

    getLabelWidget(type: Measurements): LabelWidget {
        return this.uiWindow?.findWidget(type.toString()) as LabelWidget;
    }

    setValue(type: Measurements, text: string): void {
        const label = this.uiWindow?.findWidget(type.toString() + "-value") as LabelWidget;
        label.text = text
    }

    set dropdownContent(content: string[]) {
        this.rideSelectionWidget.items = this.dropdownHeadline.concat(content);
    }

    open(onClose: () => void, onSelectRide: (index: number) => void): void {

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
    }

    label(type: Measurements): Widget {
        return {
            name: type.toString(),
            type: "label",
            width: 145,
            height: 20,
            x: 5,
            y: 50 + 10 * getIndex(type),
            text: getName(type) + ":"
        }
    }

    value(type: Measurements): Widget {
        return {
            name: type.toString() + "-value",
            type: "label",
            width: windowWidth - 10,
            height: 20,
            x: 150,
            y: 50 + 10 * getIndex(type),
            text: "-"
        }
    }
}
