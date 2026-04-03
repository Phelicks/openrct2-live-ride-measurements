/* eslint-disable indent */
const windowWidth = 220
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

export enum UiState {
    settings = 0,
    noRideSelected = 1,
    waitingForGhostTrains = 2,
    rideStats = 3,
    blockTiming = 4,
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
    private _autoResetValues = false
    private _useImperial = false
    private uiState = UiState.noRideSelected
    // used to restore the ui after a tab change
    private uiStateTabStorage: UiState | undefined

    onReset: (() => void) | undefined
    onPickRide: (() => void) | undefined
    uiWindow: Window | null = null
    dropdownHeadline = ["Select a ride"]

    constructor() {
        this._autoResetValues = context.sharedStorage.get<boolean>("phelicks.live_measurements.auto_reset") ?? false
        this._useImperial = context.sharedStorage.get<boolean>("phelicks.live_measurements.use_imperial") ?? false
    }

    get autoResetValues(): boolean { return this._autoResetValues }

    get useImperial(): boolean { return this._useImperial }

    get rideSelectionWidget(): DropdownWidget {
        return this.uiWindow?.findWidget("ride_selection") as DropdownWidget
    }

    get viewportWidget(): ViewportWidget {
        return this.uiWindow?.findWidget<ViewportWidget>("car_view")!
    }

    get resetButton(): ButtonWidget {
        return this.uiWindow?.findWidget<ButtonWidget>("reset_button")!
    }

    get toggleBlockTimeButton(): ButtonWidget {
        return this.uiWindow?.findWidget<ButtonWidget>("block_timing_toggle")!
    }

    get hintLabel(): LabelWidget {
        return this.uiWindow?.findWidget<LabelWidget>("hint_label")!
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
        const label = this.uiWindow?.findWidget<LabelWidget>(type.toString() + "-value")
        if (label) {
            label.text = text
        }
    }

    setBlockSectionValue(text: string): void {
        const label = this.uiWindow?.findWidget<LabelWidget>("block_section_label")
        if (label) {
            label.text = text
        }
    }

    set dropdownContent(content: string[]) {
        this.rideSelectionWidget.items = this.dropdownHeadline.concat(content)
    }

    setDropdownIndex(index: number): void {
        const dropdown = this.rideSelectionWidget
        if (dropdown) {
            dropdown.selectedIndex = index
        }
    }

    private updateCheckboxes() {
        const checkboxAutoReset = this.uiWindow?.findWidget<CheckboxWidget>("checkbox_auto_reset")!
        const checkboxUseImperial = this.uiWindow?.findWidget<CheckboxWidget>("checkbox_use_imperial")!
        checkboxAutoReset.isChecked = this._autoResetValues
        checkboxUseImperial.isChecked = this._useImperial
    }

    open(onClose: () => void, onSelectRide: (index: number) => void): void {
        this.uiWindow = ui.openWindow({
            classification: "live.ride.measurements",
            width: windowWidth,
            height: windowHeight,
            title: "Live Ride Measurements",
            onClose: onClose,
            onTabChange: () => {
                if(this.uiWindow?.tabIndex == 0) {
                    this.updateWindow(this.uiStateTabStorage || UiState.noRideSelected)
                }
                else if(this.uiWindow?.tabIndex == 1) {
                    this.updateCheckboxes()
                    this.uiStateTabStorage = this.uiState
                    this.updateWindow(UiState.settings)
                }
            },
            tabs: [
                // Main Tab
                {
                    image: 5229,
                    widgets: [
                        {
                            name: "ride_selection",
                            width: windowWidth - 40,
                            height: 20,
                            x: 5,
                            y: 50,
                            type: "dropdown",
                            items: this.dropdownHeadline,
                            selectedIndex: 0,
                            onChange: onSelectRide,
                        },
                        {
                            name: "pick_button",
                            type: "button",
                            x: windowWidth - 30,
                            y: 47,
                            width: 25,
                            height: 25,
                            image: "eyedropper",
                            tooltip: "Click a ride vehicle on the map to select it",
                            onClick: () => {
                                if (this.onPickRide) {
                                    this.onPickRide()
                                }
                            }
                        },
                        {
                            name: "car_view",
                            type: "viewport",
                            isVisible: false,
                            x: 5,
                            y: 75,
                            width: windowWidth - 10,
                            height: 100,
                        },
                        {
                            name: "hint_label",
                            type: "label",
                            width: 145,
                            height: 20,
                            x: 25,
                            y: 90,
                            text: "",
                            isVisible: false
                        },
                        {
                            name: "reset_button",
                            type: "button",
                            x: windowWidth - 5 - 45,
                            y: windowHeight - 5 - 15,
                            width: 45,
                            height: 15,
                            text: "Reset",
                            onClick: () => {
                                if (this.onReset) {
                                    this.onReset()
                                }
                            }
                        },
                        {
                            name: "block_timing_toggle",
                            type: "button",
                            x: 5,
                            y: windowHeight - 5 - 15,
                            width: 102,
                            height: 15,
                            text: "Show Block Timing",
                            onClick: () => {
                                if(this.uiState == UiState.rideStats) {
                                    this.updateWindow(UiState.blockTiming)
                                } else {
                                    this.updateWindow(UiState.rideStats)
                                }
                            },
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
                        // this.label(Measurements.drops, true),
                        // this.value(Measurements.drops, true),
                        // this.label(Measurements.highestDrop, true),
                        // this.value(Measurements.highestDrop, true),
                        
                        // Block Section Timing
                        {
                            name: "block_section_title",
                            type: "label",
                            isVisible: false,
                            textAlign: "left",
                            tooltip: "",
                            width: windowWidth - 10,
                            height: 20,
                            x: 5,
                            y: 180,
                            text: "Block Section Timing"
                        },
                        {
                            name: "block_section_label",
                            type: "label",
                            isVisible: false,
                            textAlign: "left",
                            tooltip: "",
                            width: windowWidth - 10,
                            height: 20,
                            x: 5,
                            y: 192,
                            text: ""
                        },
                    ]
                },
                // Settings Tab
                {
                    image: 5201,
                    widgets: [
                        {
                            name: "checkbox_auto_reset",
                            type: "checkbox",
                            width: windowWidth - 10,
                            height: 20,
                            x: 5,
                            y: 50,
                            text: "Auto reset values on new circuits",
                            tooltip: "By default the values will only be updated after the vehicle has completed a circuits.",
                            isChecked: this.autoResetValues,
                            onChange: (checked) => {
                                this._autoResetValues = checked
                                context.sharedStorage.set("phelicks.live_measurements.auto_reset", checked)
                                this.updateCheckboxes()
                            }
                        },
                        {
                            name: "checkbox_use_imperial",
                            type: "checkbox",
                            width: windowWidth - 10,
                            height: 20,
                            x: 5,
                            y: 70,
                            text: "Use imperial measurements",
                            isChecked: this.useImperial,
                            onChange: (checked) => {
                                this._useImperial = checked
                                context.sharedStorage.set("phelicks.live_measurements.use_imperial", checked)
                                this.updateCheckboxes()
                            }
                        },
                        // viewport behaves buggy in tab view
                        // adding it again to be able to hide it
                        // my be fixed in future OpenRCT2 versions
                        {
                            name: "car_view",
                            type: "viewport",
                            isVisible: false,
                            x: 5,
                            y: 75,
                            width: windowWidth - 10,
                            height: 100,
                        }
                    ],
                }
            ],

        })
    }

    label(type: Measurements, isDisabled = false): LabelWidget {
        return {
            window: this.uiWindow!!,
            name: type.toString(),
            type: "label",
            isVisible: false,
            textAlign: "left",
            tooltip: "",
            width: 145,
            height: 20,
            x: 5,
            y: 180 + 10 * getIndex(type),
            text: getName(type) + ":",
            isDisabled
        }
    }

    value(type: Measurements, isDisabled = false): LabelWidget {
        return {
            window: this.uiWindow!!,
            name: type.toString() + "-value",
            type: "label",
            isVisible: false,
            textAlign: "left",
            tooltip: "",
            width: windowWidth - 10,
            height: 20,
            x: 150,
            y: 180 + 10 * getIndex(type),
            text: "-",
            isDisabled
        }
    }

    updateWindow(uiState: UiState): void {
        if(this.uiState == uiState) return
        this.uiState = uiState

        const blockTimingTitle = this.uiWindow?.findWidget<LabelWidget>("block_section_title")!
        const blockTimingLabel = this.uiWindow?.findWidget<LabelWidget>("block_section_label")!

        switch(uiState) {
            case UiState.settings:
                break
            case UiState.noRideSelected:
                this.viewportWidget.isVisible = false
                this.valuesVisible(false)
                blockTimingTitle.isVisible = false
                blockTimingLabel.isVisible = false
                this.hintLabel.isVisible = false
                this.toggleBlockTimeButton.isVisible = false
                this.resetButton.isVisible = false
                break
            case UiState.waitingForGhostTrains:
                this.viewportWidget.isVisible = false
                this.valuesVisible(false)
                this.hintLabel.text = "Please enable ghost trains."
                this.hintLabel.isVisible = true
                this.toggleBlockTimeButton.isVisible = false
                this.resetButton.isVisible = false
                break
            case UiState.rideStats:
                this.viewportWidget.isVisible = true
                this.valuesVisible(true)
                this.hintLabel.isVisible = false
                blockTimingTitle.isVisible = false
                blockTimingLabel.isVisible = false
                this.toggleBlockTimeButton.text = "Show Block Timing"
                this.toggleBlockTimeButton.isVisible = true
                this.resetButton.isVisible = true
                break
            case UiState.blockTiming:
                this.viewportWidget.isVisible = true
                this.valuesVisible(false)
                this.hintLabel.isVisible = false
                blockTimingTitle.isVisible = true
                blockTimingLabel.isVisible = true
                this.toggleBlockTimeButton.text = "Show Stats"
                this.toggleBlockTimeButton.isVisible = true
                this.resetButton.isVisible = true
                break
        }
    }

    private valuesVisible(visible: boolean): void {
        for (const measurement in Measurements) {
            const label = this.getLabelWidget(Number(measurement))
            const value = this.getValueLabelWidget(Number(measurement))
            if (label) {
                label.isVisible = visible
            }
            if (value) {
                value.isVisible = visible
            }
        }
    }
}
