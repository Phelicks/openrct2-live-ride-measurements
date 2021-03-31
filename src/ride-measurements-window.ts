/* eslint-disable indent */
const windowWidth = 210
const windowHeight = 300

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
    currentSpeed = 13,
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
        case Measurements.currentSpeed:
            return "Current speed"
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
    return [
        Measurements.currentSpeed,
        Measurements.maxSpeed,
        Measurements.averageSpeed,
        Measurements.rideTime,
        Measurements.rideLength,
        Measurements.positiveGs,
        Measurements.negativeGs,
        Measurements.lateralGs,
        Measurements.airTime,
        Measurements.drops,
        Measurements.highestDrop,
        Measurements.excitment,
        Measurements.intensity,
        Measurements.nausea,
    ].indexOf(type)
}

export class RideMeasurementsWindow {
    uiWindow: Window | null = null;
    dropdownHeadline = ["Select a ride"];

    get rideSelectionWidget(): DropdownWidget {
        return this.uiWindow?.findWidget("ride_selection") as DropdownWidget;
    }

    get viewportWidget(): ViewportWidget {
        return this.uiWindow?.findWidget("car_view") as ViewportWidget;
    }

    getLabelWidget(type: Measurements): LabelWidget | undefined {
        for (const widget of this.uiWindow?.widgets ?? []) {
            if (widget.name == type.toString()) {
                return widget as LabelWidget
            }
        }
    }

    getValueLabelWidget(type: Measurements): LabelWidget | undefined {
        for (const widget of this.uiWindow?.widgets ?? []) {
            if (widget.name == type.toString() + "-value") {
                return widget as LabelWidget
            }
        }
    }

    setValue(type: Measurements, text: string): void {
        const label = this.uiWindow?.findWidget<LabelWidget>(type.toString() + "-value");
        if (label) {
            label.text = text
        }
    }

    set dropdownContent(content: string[]) {
        this.rideSelectionWidget.items = this.dropdownHeadline.concat(content);
    }

    open(onClose: () => void, onSelectRide: (index: number) => void): void {

        this.uiWindow = ui.openWindow({
            classification: "live.ride.measurements",
            width: windowWidth,
            height: windowHeight,
            title: "Live Ride Measurements",
            onClose: onClose,
            widgets: [
                {
                    name: "car_view",
                    type: "viewport",
                    x: 5,
                    y: 45,
                    width: windowWidth - 10,
                    height: 100,
                },
                {
                    name: "ride_selection",
                    width: windowWidth - 10,
                    height: 20,
                    x: 5,
                    y: 20,
                    type: "dropdown",
                    items: this.dropdownHeadline,
                    selectedIndex: 0,
                    onChange: onSelectRide,
                },
                {
                    name: "hint_label",
                    type: "label",
                    width: 145,
                    height: 20,
                    x: 25,
                    y: 60,
                    text: "",
                    isVisible: false
                },
                /*
                this.label(Measurements.excitment, true),
                this.value(Measurements.excitment, true),
                this.label(Measurements.intensity, true),
                this.value(Measurements.intensity, true),
                this.label(Measurements.nausea, true),
                this.value(Measurements.nausea, true),
                */
                this.label(Measurements.currentSpeed),
                this.value(Measurements.currentSpeed),
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
                this.label(Measurements.drops, true),
                this.value(Measurements.drops, true),
                this.label(Measurements.highestDrop, true),
                this.value(Measurements.highestDrop, true),
            ]
        });
    }

    hideValues(): void {
        for (const measurement in Measurements) {
            const label = this.getLabelWidget(Number(measurement))
            const value = this.getValueLabelWidget(Number(measurement))
            if (label) {
                label.isVisible = false
            }
            if (value) {
                value.isVisible = false
            }
        }
    }

    showValues(): void {
        for (const measurement in Measurements) {
            const label = this.getLabelWidget(Number(measurement))
            const value = this.getValueLabelWidget(Number(measurement))
            if (label) {
                label.isVisible = true
            }
            if (value) {
                value.isVisible = true
            }
        }
        this.updateWindow()
    }

    showHint(text: string): void {
        for (const widget of this.uiWindow?.widgets ?? []) {
            if (widget.name == "hint_label") {
                (widget as LabelWidget).text = text
                widget.isVisible = true
                return
            }
        }
        this.updateWindow()
    }

    hideHint(): void {
        for (const widget of this.uiWindow?.widgets ?? []) {
            if (widget.name == "hint_label") {
                widget.isVisible = false
                return
            }
        }
    }

    label(type: Measurements, isDisabled = false): LabelWidget {
        return {
            name: type.toString(),
            type: "label",
            width: 145,
            height: 20,
            x: 5,
            y: 150 + 10 * getIndex(type),
            text: getName(type) + ":",
            isDisabled
        }
    }

    value(type: Measurements, isDisabled = false): LabelWidget {
        return {
            name: type.toString() + "-value",
            type: "label",
            width: windowWidth - 10,
            height: 20,
            x: 150,
            y: 150 + 10 * getIndex(type),
            text: "-",
            isDisabled
        }
    }

    updateWindow(): void {
        // This is a hack because the window doesn't get
        // updated when labels are made visible/invisible
        if (this.uiWindow) {
            this.uiWindow.x += 1
            this.uiWindow.x -= 1
        }
    }
}
