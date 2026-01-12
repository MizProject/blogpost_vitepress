---

outline: deep
title: "Galaxy A12s Behavioral Output"
lang: en-US

---

# Galaxy A12s Behavioral Output on GSI Environment

Note that this Behavioral observation was done with a MizKernel Kernel for Samsung Galaxy A12s.

Stock Samsung Kernels is not recommended for use when attempting to install GSIs.

It is advisable to test the GSI's stability by visiting the app and not changing the settings at all and then restart, if the device bootloops even you did not do anything to the Treble App, that means that the Treble app is borked for the device. Advise to go to recovery mode and delete any related to Phhusson's modifications [*The scripture was lost so sadly i can't provide proper way to address this*](#)

[[toc]]

## LineageOS

There are multiple variants of Lineage, being LineageOS by MisterZtr<Badge type=tip text="Goated GSI Maintainer"></Badge>, AndyYan, and other third party Maintainers. So they will be stated separately...

### LineageOS Light by AndyYan

:::danger
This GSI build on Android 14 and later, no longer boots on Samsung Galaxy A12s, and would just redirect itself to Fastboot mode. So it is not recommended to use LineageOS light by AndyYan for that case. AndyYan will not address this issue.
:::

LineageOS Light in Android 13 was slick and smooth, and in fact was one of the greatest GSI if you want your Samsung Galaxy A12s to be smooth as a butter, but expect this:

| Device features | Is working? |
|-----------------|-------------|
| Camera          | Main 48MP only works, no wide image support, Front cam, only normal mode works, Wide cam mode are not supported, Macro and BW Lens also does not work|
| Battery         | Battery life is ok. no sudden power draw when not in use.|
| VoLTE           | Not working    |
| WiFi and BT     | Working        |
| Calls           | Does not work, requires patching/editing/modifying build.prop of `persist.vendor.audio.fluence.voicecall=true` to `persist.vendor.audio.fluence.voicecall=false`
| GPS             |  Works |
| Root            | Zygisk Works, Modules work, `su` works, LSPosed works. Magisk Kitsune 26.1 |
| Audio           | Audio works   |
| Misc            | Phhusson's Treble app does not exist, which means you cant edit the GSI's behavior, and also your device can't fall down onto bootloop lock, this rom is also suceptible to get your device losing IMEI (Some fellow in vietnam experienced it, but the fix was to enable Bluetooth Offloading) |

*Image downloads are unavailable now.*

### LineageOS TD by AndyYan

:::danger
This GSI build on Android 14 and later, no longer boots on Samsung Galaxy A12s, and would just redirect itself to Fastboot mode. So it is not recommended to use LineageOS TD by AndyYan for that case. AndyYan will not address this issue.
:::

This variant is also similar to [LineageOS Light](#lineageos-light-by-andyyan), but with added Treble Goodies from Phhusson.

| Device features | Is working? |
|-----------------|-------------|
| Camera          | Main 48MP only works, no wide image support, Front cam, only normal mode works, Wide cam mode are not supported, Macro and BW Lens also does not work|
| Battery         | Battery life is ok. no sudden power draw when not in use.|
| VoLTE           | Not working    |
| WiFi and BT     | Working        |
| Calls           | Works |
| GPS             |  Works |
| Root            | Zygisk Works, Modules work, `su` works, LSPosed works. Magisk Kitsune 26.1 |
| Audio           | Audio works   |
| Fingerprint     | None          |
| Misc            | Phhusson's Treble Settings exists, can cause bootloop if any interaction was made to the app, regardless of modified or not... |

*Image Downloads are unavailable now*

### Lineage 22.2 By MisterZtr

:::info
This is using EXT4 build, EROFS is not available due to lack of support.
:::

This LineageOS Build was made by MisterZtr And still giving updates.

| Device features | Is working? |
|-----------------|-------------|
| Camera          | Main 48MP only works, no wide image support, Front cam, only normal mode works, Wide cam mode are not supported, Macro and BW Lens also does not work|
| Battery         | Battery life is ok. no sudden power draw when not in use.|
| VoLTE           | Working via LTE Carrier Aggregation (Native)    |
| WiFi and BT     | Working        |
| Calls           | Works |
| GPS             |  Works |
| Root            | ZygiskNext Works, Modules work, Hybrid Mount works, `su` works, SuSFS works (using BRENE SUSFS module.) Rissu KernelSU v3 |
| Audio           | Audio works   |
| Fingerprint     | None          |
| Misc            | Phhusson's Treble Settings exists, can cause bootloop if any interaction was made to the app, regardless of modified or not... Banking apps that are heavily reliant on Google Frameworks, is not supported on this GSI |

[Releases](https://github.com/MizProject/super-patch-action/releases/tag/20901110963)

### Lineage 23 By MisterZtr

:::danger
It is unadvisable to use this GSI if your device does not have proper FUSE and FUSE-bpf support. But this will be solved soon i think?
:::

:::danger
Do not install the GSI unless if your kernel is certified to have FUSE-BPF patches, and some other stuff from 5.x being backported
:::

## PixelExperience

*No data*

## AxionOS

AxionOS 1.1

| Device features | Is working? |
|-----------------|-------------|
| Camera          | Main and Wide Cam works at rear only. Same with Front Cam. |
| Battery         | Has some scenario where it eats little aggresively... |
| VoLTE           | None    |
| WiFi and BT     | Working        |
| Calls           | Works |
| GPS             |  Works |
| Root            | ZygiskNext Works, Modules work, LSPosed works, `su` works, SuSFS works, Rissu KernelSU v1.x |
| Audio           | Audio works   |
| Fingerprint     | None          |
| Misc            | Phhusson's Treble Settings exists, can cause bootloop if any interaction was made to the app, regardless of modified or not...  |

## DerpFest

*No data*

## EvolutionX

There are so many EvoX maintainers that it would take a while to write everyone.

*In construction*