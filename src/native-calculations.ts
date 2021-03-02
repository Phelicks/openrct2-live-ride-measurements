/* eslint-disable indent */
import bigInt from "big-integer"

export {
    getGForces
}


function getGForces(
    trackType: TrackElemType,
    vehicleSpriteType: number,
    bankRotation: number,
    trackProgress: number,
    velocity: number,
): {
    gForceVert: number;
    gForceLateral: number;
} {
    let lateralFactor = 0
    let vertFactor = 0

    switch (trackType) {
        case TrackElemType.Flat:
        case TrackElemType.EndStation:
        case TrackElemType.BeginStation:
        case TrackElemType.MiddleStation:
        case TrackElemType.Up25:
        case TrackElemType.Up60: //
        case TrackElemType.Down25:
        case TrackElemType.Down60: //
        case TrackElemType.FlatToLeftBank:
        case TrackElemType.FlatToRightBank:
        case TrackElemType.LeftBankToFlat:
        case TrackElemType.RightBankToFlat: //
        case TrackElemType.LeftBank:
        case TrackElemType.RightBank:
        case TrackElemType.TowerBase:
        case TrackElemType.TowerSection:
        case TrackElemType.FlatCovered:
        case TrackElemType.Up25Covered:
        case TrackElemType.Up60Covered:
        case TrackElemType.Down25Covered:
        case TrackElemType.Down60Covered:
        case TrackElemType.Brakes:
        case TrackElemType.RotationControlToggle:
        case TrackElemType.Maze:
        case TrackElemType.Up25LeftBanked:
        case TrackElemType.Up25RightBanked:
        case TrackElemType.Waterfall:
        case TrackElemType.Rapids:
        case TrackElemType.OnRidePhoto:
        case TrackElemType.Down25LeftBanked:
        case TrackElemType.Down25RightBanked:
        case TrackElemType.Whirlpool:
        case TrackElemType.ReverseFreefallVertical:
        case TrackElemType.Up90:
        case TrackElemType.Down90:
        case TrackElemType.DiagFlat:
        case TrackElemType.DiagUp25:
        case TrackElemType.DiagUp60:
        case TrackElemType.DiagDown25:
        case TrackElemType.DiagDown60:
        case TrackElemType.DiagFlatToLeftBank:
        case TrackElemType.DiagFlatToRightBank:
        case TrackElemType.DiagLeftBankToFlat:
        case TrackElemType.DiagRightBankToFlat:
        case TrackElemType.DiagLeftBank:
        case TrackElemType.DiagRightBank:
        case TrackElemType.LogFlumeReverser:
        case TrackElemType.SpinningTunnel:
        case TrackElemType.PoweredLift:
        case TrackElemType.MinigolfHoleA:
        case TrackElemType.MinigolfHoleB:
        case TrackElemType.MinigolfHoleC:
        case TrackElemType.MinigolfHoleD:
        case TrackElemType.MinigolfHoleE:
        case TrackElemType.LeftReverser:
        case TrackElemType.RightReverser:
        case TrackElemType.AirThrustVerticalDown:
        case TrackElemType.BlockBrakes:
        case TrackElemType.Up25ToLeftBankedUp25:
        case TrackElemType.Up25ToRightBankedUp25:
        case TrackElemType.LeftBankedUp25ToUp25:
        case TrackElemType.RightBankedUp25ToUp25:
        case TrackElemType.Down25ToLeftBankedDown25:
        case TrackElemType.Down25ToRightBankedDown25:
        case TrackElemType.LeftBankedDown25ToDown25:
        case TrackElemType.RightBankedDown25ToDown25:
        case TrackElemType.LeftQuarterTurn1TileUp90:
        case TrackElemType.RightQuarterTurn1TileUp90:
        case TrackElemType.LeftQuarterTurn1TileDown90:
        case TrackElemType.RightQuarterTurn1TileDown90:
            // 6d73FF
            // Do nothing
            break
        case TrackElemType.FlatToUp25:   //
        case TrackElemType.Down25ToFlat: //
        case TrackElemType.LeftBankToUp25:
        case TrackElemType.RightBankToUp25:
        case TrackElemType.Down25ToLeftBank:
        case TrackElemType.Down25ToRightBank:
        case TrackElemType.FlatToUp25Covered:
        case TrackElemType.Down25ToFlatCovered:
        case TrackElemType.LeftBankedFlatToLeftBankedUp25:
        case TrackElemType.RightBankedFlatToRightBankedUp25:
        case TrackElemType.LeftBankedDown25ToLeftBankedFlat:
        case TrackElemType.RightBankedDown25ToRightBankedFlat:
        case TrackElemType.FlatToLeftBankedUp25:
        case TrackElemType.FlatToRightBankedUp25:
        case TrackElemType.LeftBankedDown25ToFlat:
        case TrackElemType.RightBankedDown25ToFlat:
            vertFactor = 103
            // 6d7509
            break
        case TrackElemType.Up25ToFlat:   //
        case TrackElemType.FlatToDown25: //
        case TrackElemType.Up25ToLeftBank:
        case TrackElemType.Up25ToRightBank:
        case TrackElemType.LeftBankToDown25:
        case TrackElemType.RightBankToDown25:
        case TrackElemType.Up25ToFlatCovered:
        case TrackElemType.FlatToDown25Covered:
        case TrackElemType.CableLiftHill:
        case TrackElemType.LeftBankedUp25ToLeftBankedFlat:
        case TrackElemType.RightBankedUp25ToRightBankedFlat:
        case TrackElemType.LeftBankedFlatToLeftBankedDown25:
        case TrackElemType.RightBankedFlatToRightBankedDown25:
        case TrackElemType.LeftBankedUp25ToFlat:
        case TrackElemType.RightBankedUp25ToFlat:
        case TrackElemType.FlatToLeftBankedDown25:
        case TrackElemType.FlatToRightBankedDown25:
            vertFactor = -103
            // 6d7569
            break
        case TrackElemType.Up25ToUp60:     //
        case TrackElemType.Down60ToDown25: //
        case TrackElemType.Up25ToUp60Covered:
        case TrackElemType.Down60ToDown25Covered:
            vertFactor = 82
            // 6d7545
            break
        case TrackElemType.Up60ToUp25:     //
        case TrackElemType.Down25ToDown60: //
        case TrackElemType.Up60ToUp25Covered:
        case TrackElemType.Down25ToDown60Covered:
            vertFactor = -82
            // 6d7551
            break
        case TrackElemType.LeftQuarterTurn5Tiles: //
        case TrackElemType.LeftQuarterTurn5TilesUp25:
        case TrackElemType.LeftQuarterTurn5TilesDown25:
        case TrackElemType.LeftTwistDownToUp:
        case TrackElemType.LeftTwistUpToDown:
        case TrackElemType.LeftQuarterTurn5TilesCovered:
        case TrackElemType.LeftQuarterHelixLargeUp:
        case TrackElemType.LeftQuarterHelixLargeDown:
        case TrackElemType.LeftFlyerTwistUp:
        case TrackElemType.LeftFlyerTwistDown:
        case TrackElemType.LeftHeartLineRoll:
            lateralFactor = 98
            // 6d7590
            break
        case TrackElemType.RightQuarterTurn5Tiles: //
        case TrackElemType.RightQuarterTurn5TilesUp25:
        case TrackElemType.RightQuarterTurn5TilesDown25:
        case TrackElemType.RightTwistDownToUp:
        case TrackElemType.RightTwistUpToDown:
        case TrackElemType.RightQuarterTurn5TilesCovered:
        case TrackElemType.RightQuarterHelixLargeUp:
        case TrackElemType.RightQuarterHelixLargeDown:
        case TrackElemType.RightFlyerTwistUp:
        case TrackElemType.RightFlyerTwistDown:
        case TrackElemType.RightHeartLineRoll:
            lateralFactor = -98
            // 6d75B7
            break
        case TrackElemType.BankedLeftQuarterTurn5Tiles:
        case TrackElemType.LeftHalfBankedHelixUpLarge:
        case TrackElemType.LeftHalfBankedHelixDownLarge:
        case TrackElemType.LeftQuarterBankedHelixLargeUp:
        case TrackElemType.LeftQuarterBankedHelixLargeDown:
            vertFactor = 200
            lateralFactor = 160
            // 6d75E1
            break
        case TrackElemType.BankedRightQuarterTurn5Tiles:
        case TrackElemType.RightHalfBankedHelixUpLarge:
        case TrackElemType.RightHalfBankedHelixDownLarge:
        case TrackElemType.RightQuarterBankedHelixLargeUp:
        case TrackElemType.RightQuarterBankedHelixLargeDown:
            vertFactor = 200
            lateralFactor = -160
            // 6d75F0
            break
        case TrackElemType.SBendLeft:
        case TrackElemType.SBendLeftCovered:
            lateralFactor = (trackProgress < 48) ? 98 : -98
            // 6d75FF
            break
        case TrackElemType.SBendRight:
        case TrackElemType.SBendRightCovered:
            lateralFactor = (trackProgress < 48) ? -98 : 98
            // 6d7608
            break
        case TrackElemType.LeftVerticalLoop:
        case TrackElemType.RightVerticalLoop:
            vertFactor = (Math.abs(trackProgress - 155) / 2) + 28
            // 6d7690
            break
        case TrackElemType.LeftQuarterTurn3Tiles:
        case TrackElemType.LeftQuarterTurn3TilesUp25:
        case TrackElemType.LeftQuarterTurn3TilesDown25:
        case TrackElemType.LeftQuarterTurn3TilesCovered:
        case TrackElemType.LeftCurvedLiftHill:
            lateralFactor = 59
            // 6d7704
            break
        case TrackElemType.RightQuarterTurn3Tiles:
        case TrackElemType.RightQuarterTurn3TilesUp25:
        case TrackElemType.RightQuarterTurn3TilesDown25:
        case TrackElemType.RightQuarterTurn3TilesCovered:
        case TrackElemType.RightCurvedLiftHill:
            lateralFactor = -59
            // 6d7710
            break
        case TrackElemType.LeftBankedQuarterTurn3Tiles:
        case TrackElemType.LeftHalfBankedHelixUpSmall:
        case TrackElemType.LeftHalfBankedHelixDownSmall:
            vertFactor = 100
            lateralFactor = 100
            // 6d7782
            break
        case TrackElemType.RightBankedQuarterTurn3Tiles:
        case TrackElemType.RightHalfBankedHelixUpSmall:
        case TrackElemType.RightHalfBankedHelixDownSmall:
            vertFactor = 100
            lateralFactor = -100
            // 6d778E
            break
        case TrackElemType.LeftQuarterTurn1Tile:
            lateralFactor = 45
            // 6d779A
            break
        case TrackElemType.RightQuarterTurn1Tile:
            lateralFactor = -45
            // 6d77A3
            break
        case TrackElemType.HalfLoopUp:
        case TrackElemType.FlyerHalfLoopUp:
            vertFactor = (((-(trackProgress - 155))) / 2) + 28
            // 6d763E
            break
        case TrackElemType.HalfLoopDown:
        case TrackElemType.FlyerHalfLoopDown:
            vertFactor = (trackProgress / 2) + 28
            // 6d7656
            break
        case TrackElemType.LeftCorkscrewUp:
        case TrackElemType.RightCorkscrewDown:
        case TrackElemType.LeftFlyerCorkscrewUp:
        case TrackElemType.RightFlyerCorkscrewDown:
            vertFactor = 52
            lateralFactor = 70
            // 6d76AA
            break
        case TrackElemType.RightCorkscrewUp:
        case TrackElemType.LeftCorkscrewDown:
        case TrackElemType.RightFlyerCorkscrewUp:
        case TrackElemType.LeftFlyerCorkscrewDown:
            vertFactor = 52
            lateralFactor = -70
            // 6d76B9
            break
        case TrackElemType.FlatToUp60:
        case TrackElemType.Down60ToFlat:
            vertFactor = 56
            // 6d747C
            break
        case TrackElemType.Up60ToFlat:
        case TrackElemType.FlatToDown60:
        case TrackElemType.BrakeForDrop:
            vertFactor = -56
            // 6d7488
            break
        case TrackElemType.LeftQuarterTurn1TileUp60:
        case TrackElemType.LeftQuarterTurn1TileDown60:
            lateralFactor = 88
            // 6d7770
            break
        case TrackElemType.RightQuarterTurn1TileUp60:
        case TrackElemType.RightQuarterTurn1TileDown60:
            lateralFactor = -88
            // 6d7779
            break
        case TrackElemType.Watersplash:
            vertFactor = -150
            if (trackProgress < 32)
                break
            vertFactor = 150
            if (trackProgress < 64)
                break
            vertFactor = 0
            if (trackProgress < 96)
                break
            vertFactor = 150
            if (trackProgress < 128)
                break
            vertFactor = -150
            // 6d7408
            break
        case TrackElemType.FlatToUp60LongBase:
        case TrackElemType.Down60ToFlatLongBase:
            vertFactor = 160
            // 6d74F1
            break
        case TrackElemType.Up60ToFlatLongBase:
        case TrackElemType.FlatToDown60LongBase:
            vertFactor = -160
            // 6d74FD
            break
        case TrackElemType.ReverseFreefallSlope:
        case TrackElemType.AirThrustVerticalDownToLevel:
            vertFactor = 120
            // 6d7458
            break
        case TrackElemType.Up60ToUp90:
        case TrackElemType.Down90ToDown60:
            vertFactor = 110
            // 6d7515
            break
        case TrackElemType.Up90ToUp60:
        case TrackElemType.Down60ToDown90:
            vertFactor = -110
            // 6d7521
            break
        case TrackElemType.LeftEighthToDiag:
        case TrackElemType.LeftEighthToOrthogonal:
            lateralFactor = 137
            // 6d7575
            break
        case TrackElemType.RightEighthToDiag:
        case TrackElemType.RightEighthToOrthogonal:
            lateralFactor = -137
            // 6d759C
            break
        case TrackElemType.LeftEighthBankToDiag:
        case TrackElemType.LeftEighthBankToOrthogonal:
            vertFactor = 270
            lateralFactor = 200
            // 6d75C3
            break
        case TrackElemType.RightEighthBankToDiag:
        case TrackElemType.RightEighthBankToOrthogonal:
            vertFactor = 270
            lateralFactor = -200
            // 6d75D2
            break
        case TrackElemType.DiagFlatToUp25:
        case TrackElemType.DiagDown25ToFlat:
        case TrackElemType.DiagLeftBankToUp25:
        case TrackElemType.DiagRightBankToUp25:
        case TrackElemType.DiagDown25ToLeftBank:
        case TrackElemType.DiagDown25ToRightBank:
            vertFactor = 113
            // 6d7494
            break
        case TrackElemType.DiagUp25ToFlat:
        case TrackElemType.DiagFlatToDown25:
        case TrackElemType.DiagUp25ToLeftBank:
        case TrackElemType.DiagUp25ToRightBank:
        case TrackElemType.DiagLeftBankToDown25:
        case TrackElemType.DiagRightBankToDown25:
            vertFactor = -113
            // 6d755D
            break
        case TrackElemType.DiagUp25ToUp60:
        case TrackElemType.DiagDown60ToDown25:
            vertFactor = 95
            // 6D752D
            break
        case TrackElemType.DiagUp60ToUp25:
        case TrackElemType.DiagDown25ToDown60:
            vertFactor = -95
            // 6D7539
            break
        case TrackElemType.DiagFlatToUp60:
        case TrackElemType.DiagDown60ToFlat:
            vertFactor = 60
            // 6D7464
            break
        case TrackElemType.DiagUp60ToFlat:
        case TrackElemType.DiagFlatToDown60:
            vertFactor = -60
            // 6d7470
            break
        case TrackElemType.LeftBarrelRollUpToDown:
        case TrackElemType.LeftBarrelRollDownToUp:
            vertFactor = 170
            lateralFactor = 115
            // 6d7581
            break
        case TrackElemType.RightBarrelRollUpToDown:
        case TrackElemType.RightBarrelRollDownToUp:
            vertFactor = 170
            lateralFactor = -115
            // 6d75A8
            break
        case TrackElemType.LeftBankToLeftQuarterTurn3TilesUp25:
            vertFactor = -(trackProgress / 2) + 134
            lateralFactor = 90
            // 6d771C
            break
        case TrackElemType.RightBankToRightQuarterTurn3TilesUp25:
            vertFactor = -(trackProgress / 2) + 134
            lateralFactor = -90
            // 6D7746
            break
        case TrackElemType.LeftQuarterTurn3TilesDown25ToLeftBank:
            vertFactor = -(trackProgress / 2) + 134
            lateralFactor = 90
            // 6D7731 identical to 6d771c
            break
        case TrackElemType.RightQuarterTurn3TilesDown25ToRightBank:
            vertFactor = -(trackProgress / 2) + 134
            lateralFactor = -90
            // 6D775B identical to 6d7746
            break
        case TrackElemType.LeftLargeHalfLoopUp:
        case TrackElemType.RightLargeHalfLoopUp:
            vertFactor = (((-(trackProgress - 311))) / 4) + 46
            // 6d7666
            break
        case TrackElemType.RightLargeHalfLoopDown:
        case TrackElemType.LeftLargeHalfLoopDown:
            vertFactor = (trackProgress / 4) + 46
            // 6d767F
            break
        case TrackElemType.HeartLineTransferUp:
            vertFactor = 103
            if (trackProgress < 32)
                break
            vertFactor = -103
            if (trackProgress < 64)
                break
            vertFactor = 0
            if (trackProgress < 96)
                break
            vertFactor = 103
            if (trackProgress < 128)
                break
            vertFactor = -103
            // 6d74A0
            break
        case TrackElemType.HeartLineTransferDown:
            vertFactor = -103
            if (trackProgress < 32)
                break
            vertFactor = 103
            if (trackProgress < 64)
                break
            vertFactor = 0
            if (trackProgress < 96)
                break
            vertFactor = -103
            if (trackProgress < 128)
                break
            vertFactor = 103
            // 6D74CA
            break
        case TrackElemType.MultiDimInvertedFlatToDown90QuarterLoop:
        case TrackElemType.InvertedFlatToDown90QuarterLoop:
        case TrackElemType.MultiDimFlatToDown90QuarterLoop:
            vertFactor = (trackProgress / 4) + 55
            // 6d762D
            break
        case TrackElemType.Up90ToInvertedFlatQuarterLoop:
        case TrackElemType.MultiDimUp90ToInvertedFlatQuarterLoop:
        case TrackElemType.MultiDimInvertedUp90ToFlatQuarterLoop:
            vertFactor = (((-(trackProgress - 137))) / 4) + 55
            // 6D7614
            break
        case TrackElemType.AirThrustTopCap:
            vertFactor = -60
            // 6D744C
            break
        case TrackElemType.LeftBankedQuarterTurn3TileUp25:
        case TrackElemType.LeftBankedQuarterTurn3TileDown25:
            vertFactor = 200
            lateralFactor = 100
            // 6d76C8
            break
        case TrackElemType.RightBankedQuarterTurn3TileUp25:
        case TrackElemType.RightBankedQuarterTurn3TileDown25:
            vertFactor = 200
            lateralFactor = -100
            // 6d76d7
            break
        case TrackElemType.LeftBankedQuarterTurn5TileUp25:
        case TrackElemType.LeftBankedQuarterTurn5TileDown25:
            vertFactor = 200
            lateralFactor = 160
            // 6D76E6
            break
        case TrackElemType.RightBankedQuarterTurn5TileUp25:
        case TrackElemType.RightBankedQuarterTurn5TileDown25:
            vertFactor = 200
            lateralFactor = -160
            // 6d76F5
            break
    }

    let gForceLateral = 0
    let gForceVertBig = (bigInt(0x280000).multiply(Unk9A37E4[vehicleSpriteType])).shiftRight(32)
    gForceVertBig = (bigInt(gForceVertBig).multiply(Unk9A39C4[bankRotation])).shiftRight(32)
    let gForceVert = gForceVertBig.toJSNumber()

    if (vertFactor != 0) {
        gForceVert += Math.abs(velocity) * 98 / vertFactor
    }

    if (lateralFactor != 0) {
        gForceLateral += Math.abs(velocity) * 98 / lateralFactor
    }

    gForceVert = Math.floor(gForceVert)
    gForceVert *= 10
    gForceLateral *= 10
    gForceVert >>= 16
    gForceLateral >>= 16
    return {
        gForceVert: gForceVert,
        gForceLateral: gForceLateral,
    }
}

enum TrackElemType {
    Flat = 0,
    EndStation = 1,
    BeginStation = 2,
    MiddleStation = 3,
    Up25 = 4,
    Up60 = 5,
    FlatToUp25 = 6,
    Up25ToUp60 = 7,
    Up60ToUp25 = 8,
    Up25ToFlat = 9,
    Down25 = 10,
    Down60 = 11,
    FlatToDown25 = 12,
    Down25ToDown60 = 13,
    Down60ToDown25 = 14,
    Down25ToFlat = 15,
    LeftQuarterTurn5Tiles = 16,
    RightQuarterTurn5Tiles = 17,
    FlatToLeftBank = 18,
    FlatToRightBank = 19,
    LeftBankToFlat = 20,
    RightBankToFlat = 21,
    BankedLeftQuarterTurn5Tiles = 22,
    BankedRightQuarterTurn5Tiles = 23,
    LeftBankToUp25 = 24,
    RightBankToUp25 = 25,
    Up25ToLeftBank = 26,
    Up25ToRightBank = 27,
    LeftBankToDown25 = 28,
    RightBankToDown25 = 29,
    Down25ToLeftBank = 30,
    Down25ToRightBank = 31,
    LeftBank = 32,
    RightBank = 33,
    LeftQuarterTurn5TilesUp25 = 34,
    RightQuarterTurn5TilesUp25 = 35,
    LeftQuarterTurn5TilesDown25 = 36,
    RightQuarterTurn5TilesDown25 = 37,
    SBendLeft = 38,
    SBendRight = 39,
    LeftVerticalLoop = 40,
    RightVerticalLoop = 41,
    LeftQuarterTurn3Tiles = 42,
    RightQuarterTurn3Tiles = 43,
    LeftBankedQuarterTurn3Tiles = 44,
    RightBankedQuarterTurn3Tiles = 45,
    LeftQuarterTurn3TilesUp25 = 46,
    RightQuarterTurn3TilesUp25 = 47,
    LeftQuarterTurn3TilesDown25 = 48,
    RightQuarterTurn3TilesDown25 = 49,
    LeftQuarterTurn1Tile = 50,
    RightQuarterTurn1Tile = 51,
    LeftTwistDownToUp = 52,
    RightTwistDownToUp = 53,
    LeftTwistUpToDown = 54,
    RightTwistUpToDown = 55,
    HalfLoopUp = 56,
    HalfLoopDown = 57,
    LeftCorkscrewUp = 58,
    RightCorkscrewUp = 59,
    LeftCorkscrewDown = 60,
    RightCorkscrewDown = 61,
    FlatToUp60 = 62,
    Up60ToFlat = 63,
    FlatToDown60 = 64,
    Down60ToFlat = 65,
    TowerBase = 66,
    TowerSection = 67,
    FlatCovered = 68,
    Up25Covered = 69,
    Up60Covered = 70,
    FlatToUp25Covered = 71,
    Up25ToUp60Covered = 72,
    Up60ToUp25Covered = 73,
    Up25ToFlatCovered = 74,
    Down25Covered = 75,
    Down60Covered = 76,
    FlatToDown25Covered = 77,
    Down25ToDown60Covered = 78,
    Down60ToDown25Covered = 79,
    Down25ToFlatCovered = 80,
    LeftQuarterTurn5TilesCovered = 81,
    RightQuarterTurn5TilesCovered = 82,
    SBendLeftCovered = 83,
    SBendRightCovered = 84,
    LeftQuarterTurn3TilesCovered = 85,
    RightQuarterTurn3TilesCovered = 86,
    LeftHalfBankedHelixUpSmall = 87,
    RightHalfBankedHelixUpSmall = 88,
    LeftHalfBankedHelixDownSmall = 89,
    RightHalfBankedHelixDownSmall = 90,
    LeftHalfBankedHelixUpLarge = 91,
    RightHalfBankedHelixUpLarge = 92,
    LeftHalfBankedHelixDownLarge = 93,
    RightHalfBankedHelixDownLarge = 94,
    LeftQuarterTurn1TileUp60 = 95,
    RightQuarterTurn1TileUp60 = 96,
    LeftQuarterTurn1TileDown60 = 97,
    RightQuarterTurn1TileDown60 = 98,
    Brakes = 99,
    RotationControlToggleAlias = 100,
    Booster = 100,
    Maze = 101,
    // Used by the multi-dimension coaster, as TD6 cannot handle index 255.
    InvertedUp90ToFlatQuarterLoopAlias = 101,
    LeftQuarterBankedHelixLargeUp = 102,
    RightQuarterBankedHelixLargeUp = 103,
    LeftQuarterBankedHelixLargeDown = 104,
    RightQuarterBankedHelixLargeDown = 105,
    LeftQuarterHelixLargeUp = 106,
    RightQuarterHelixLargeUp = 107,
    LeftQuarterHelixLargeDown = 108,
    RightQuarterHelixLargeDown = 109,
    Up25LeftBanked = 110,
    Up25RightBanked = 111,
    Waterfall = 112,
    Rapids = 113,
    OnRidePhoto = 114,
    Down25LeftBanked = 115,
    Down25RightBanked = 116,
    Watersplash = 117,
    FlatToUp60LongBase = 118,
    Up60ToFlatLongBase = 119,
    Whirlpool = 120,
    Down60ToFlatLongBase = 121,
    FlatToDown60LongBase = 122,
    CableLiftHill = 123,
    ReverseFreefallSlope = 124,
    ReverseFreefallVertical = 125,
    Up90 = 126,
    Down90 = 127,
    Up60ToUp90 = 128,
    Down90ToDown60 = 129,
    Up90ToUp60 = 130,
    Down60ToDown90 = 131,
    BrakeForDrop = 132,
    LeftEighthToDiag = 133,
    RightEighthToDiag = 134,
    LeftEighthToOrthogonal = 135,
    RightEighthToOrthogonal = 136,
    LeftEighthBankToDiag = 137,
    RightEighthBankToDiag = 138,
    LeftEighthBankToOrthogonal = 139,
    RightEighthBankToOrthogonal = 140,
    DiagFlat = 141,
    DiagUp25 = 142,
    DiagUp60 = 143,
    DiagFlatToUp25 = 144,
    DiagUp25ToUp60 = 145,
    DiagUp60ToUp25 = 146,
    DiagUp25ToFlat = 147,
    DiagDown25 = 148,
    DiagDown60 = 149,
    DiagFlatToDown25 = 150,
    DiagDown25ToDown60 = 151,
    DiagDown60ToDown25 = 152,
    DiagDown25ToFlat = 153,
    DiagFlatToUp60 = 154,
    DiagUp60ToFlat = 155,
    DiagFlatToDown60 = 156,
    DiagDown60ToFlat = 157,
    DiagFlatToLeftBank = 158,
    DiagFlatToRightBank = 159,
    DiagLeftBankToFlat = 160,
    DiagRightBankToFlat = 161,
    DiagLeftBankToUp25 = 162,
    DiagRightBankToUp25 = 163,
    DiagUp25ToLeftBank = 164,
    DiagUp25ToRightBank = 165,
    DiagLeftBankToDown25 = 166,
    DiagRightBankToDown25 = 167,
    DiagDown25ToLeftBank = 168,
    DiagDown25ToRightBank = 169,
    DiagLeftBank = 170,
    DiagRightBank = 171,
    LogFlumeReverser = 172,
    SpinningTunnel = 173,
    LeftBarrelRollUpToDown = 174,
    RightBarrelRollUpToDown = 175,
    LeftBarrelRollDownToUp = 176,
    RightBarrelRollDownToUp = 177,
    LeftBankToLeftQuarterTurn3TilesUp25 = 178,
    RightBankToRightQuarterTurn3TilesUp25 = 179,
    LeftQuarterTurn3TilesDown25ToLeftBank = 180,
    RightQuarterTurn3TilesDown25ToRightBank = 181,
    PoweredLift = 182,
    LeftLargeHalfLoopUp = 183,
    RightLargeHalfLoopUp = 184,
    RightLargeHalfLoopDown = 185,
    LeftLargeHalfLoopDown = 186,
    LeftFlyerTwistUp = 187,
    RightFlyerTwistUp = 188,
    LeftFlyerTwistDown = 189,
    RightFlyerTwistDown = 190,
    FlyerHalfLoopUp = 191,
    FlyerHalfLoopDown = 192,
    LeftFlyerCorkscrewUp = 193,
    RightFlyerCorkscrewUp = 194,
    LeftFlyerCorkscrewDown = 195,
    RightFlyerCorkscrewDown = 196,
    HeartLineTransferUp = 197,
    HeartLineTransferDown = 198,
    LeftHeartLineRoll = 199,
    RightHeartLineRoll = 200,
    MinigolfHoleA = 201,
    MinigolfHoleB = 202,
    MinigolfHoleC = 203,
    MinigolfHoleD = 204,
    MinigolfHoleE = 205,
    MultiDimInvertedFlatToDown90QuarterLoop = 206,
    Up90ToInvertedFlatQuarterLoop = 207,
    InvertedFlatToDown90QuarterLoop = 208,
    LeftCurvedLiftHill = 209,
    RightCurvedLiftHill = 210,
    LeftReverser = 211,
    RightReverser = 212,
    AirThrustTopCap = 213,
    AirThrustVerticalDown = 214,
    AirThrustVerticalDownToLevel = 215,
    BlockBrakes = 216,
    LeftBankedQuarterTurn3TileUp25 = 217,
    RightBankedQuarterTurn3TileUp25 = 218,
    LeftBankedQuarterTurn3TileDown25 = 219,
    RightBankedQuarterTurn3TileDown25 = 220,
    LeftBankedQuarterTurn5TileUp25 = 221,
    RightBankedQuarterTurn5TileUp25 = 222,
    LeftBankedQuarterTurn5TileDown25 = 223,
    RightBankedQuarterTurn5TileDown25 = 224,
    Up25ToLeftBankedUp25 = 225,
    Up25ToRightBankedUp25 = 226,
    LeftBankedUp25ToUp25 = 227,
    RightBankedUp25ToUp25 = 228,
    Down25ToLeftBankedDown25 = 229,
    Down25ToRightBankedDown25 = 230,
    LeftBankedDown25ToDown25 = 231,
    RightBankedDown25ToDown25 = 232,
    LeftBankedFlatToLeftBankedUp25 = 233,
    RightBankedFlatToRightBankedUp25 = 234,
    LeftBankedUp25ToLeftBankedFlat = 235,
    RightBankedUp25ToRightBankedFlat = 236,
    LeftBankedFlatToLeftBankedDown25 = 237,
    RightBankedFlatToRightBankedDown25 = 238,
    LeftBankedDown25ToLeftBankedFlat = 239,
    RightBankedDown25ToRightBankedFlat = 240,
    FlatToLeftBankedUp25 = 241,
    FlatToRightBankedUp25 = 242,
    LeftBankedUp25ToFlat = 243,
    RightBankedUp25ToFlat = 244,
    FlatToLeftBankedDown25 = 245,
    FlatToRightBankedDown25 = 246,
    LeftBankedDown25ToFlat = 247,
    RightBankedDown25ToFlat = 248,
    LeftQuarterTurn1TileUp90 = 249,
    RightQuarterTurn1TileUp90 = 250,
    LeftQuarterTurn1TileDown90 = 251,
    RightQuarterTurn1TileDown90 = 252,
    MultiDimUp90ToInvertedFlatQuarterLoop = 253,
    MultiDimFlatToDown90QuarterLoop = 254,
    MultiDimInvertedUp90ToFlatQuarterLoop = 255,
    RotationControlToggle = 256,

    FlatTrack1x4A = 257,
    FlatTrack2x2 = 258,
    FlatTrack4x4 = 259,
    FlatTrack2x4 = 260,
    FlatTrack1x5 = 261,
    FlatTrack1x1A = 262,
    FlatTrack1x4B = 263,
    FlatTrack1x1B = 264,
    FlatTrack1x4C = 265,
    FlatTrack3x3 = 266,

    Count = 267,
    None = 65535,

    FlatTrack1x4A_Alias = 95,
    FlatTrack2x2_Alias = 110,
    FlatTrack4x4_Alias = 111,
    FlatTrack2x4_Alias = 115,
    FlatTrack1x5_Alias = 116,
    FlatTrack1x1A_Alias = 118,
    FlatTrack1x4B_Alias = 119,
    FlatTrack1x1B_Alias = 121,
    FlatTrack1x4C_Alias = 122,
    FlatTrack3x3_Alias = 123,
}

const Unk9A37E4 =
    [
        2147483647,
        2106585154,
        1985590284,
        1636362342,
        1127484953,
        2106585154,
        1985590284,
        1636362342,
        1127484953,
        58579923,
        0,
        - 555809667,
        -1073741824,
        -1518500249,
        -1859775391,
        -2074309916,
        -2147483647,
        58579923,
        0,
        -555809667,
        -1073741824,
        -1518500249,
        -1859775391,
        -2074309916,
        1859775393,
        1073741824,
        0,
        -1073741824,
        -1859775393,
        1859775393,
        1073741824,
        0,
        -1073741824,
        -1859775393,
        1859775393,
        1073741824,
        0,
        -1073741824,
        -1859775393,
        1859775393,
        1073741824,
        0,
        -1073741824,
        -1859775393,
        2144540595,
        2139311823,
        2144540595,
        2139311823,
        2135719507,
        2135719507,
        2125953864,
        2061796213,
        1411702590,
        2125953864,
        2061796213,
        1411702590,
        1985590284,
        1636362342,
        1127484953,
        2115506168,
    ]

const Unk9A39C4 =
    [
        2147483647,
        2096579710,
        1946281152,
        2096579710,
        1946281152,
        1380375879,
        555809667,
        - 372906620,
        -1231746017,
        -1859775391,
        1380375879,
        555809667,
        -372906620,
        -1231746017,
        -1859775391,
        0,
        2096579710,
        1946281152,
        2096579710,
        1946281152,
    ]