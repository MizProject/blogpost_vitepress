---

outline: deep
title: "Applying KSU Patches (4.19 & earlier)"
lang: en-US

---

# How to apply KernelSU Patches

::: tip
This instruction only follows the `NGKI` Model, the `GKI` Model can still be used on KPROBES but that availability is limited, for example with Samsung devices having strict root kernel protections, but today's strats is now using an LKM, see [the official KSU guide talking about it](https://kernelsu.org/guide/installation.html#lkm-mode)
:::

**Table of contents**:

[[toc]]

## Introduction

So, your device is a bit too old to be in GKI method, and LKM, and just right to be in NGKI versions? (4.1x?), then it is still fine to root with KernelSU but this time without using tiann's KernelSU because they already abandoned the NGKI and GKI users (GKI users aren't being completely dropped off) in favor of LKM users.

You can still root your kernel without tiann's KernelSU since there are a few alternatives to make your device rooted with KernelSU.

Those are:

- KernelSU Next (Legacy)
- Rissu KSU
- SukiSU

:::info
Q: But what about using magisk? <br>
A: Magisk is not perfect to use, and it's easy to get spotted by root checkers.
:::

:::tip
We are using Rissu KernelSU / Rissu KSU to root the device, since they are closer to tiann's KernelSU, yet maintaining the old device support
:::

## Get a kernel first and some dependencies

Get your device kernel first and some toolchains, then prepare your containers if you are planning to build a kernel on a container.

:::tip
For samsung devices, you can grab the kernel files to the [Samsung OpenSource Page](https://opensource.samsung.com) and at Linaro repos for Exynos Common patches, for Xiaomi and others, you can inspect the Linaro repos, or Xiaomi Github Pages.

You also need to find GCC and Clang for it, as for GCC, its usually just GCC `android-4.9`.
:::

:::tip
When using a container method, make sure the container is on Ubuntu 22.04
:::

:::tip
When looking for a Clang compiler, i suggest using r383902 instead of the suggested r353783 because the r383902 has better optimizations. Though you can use r450784 but you need to add `strcpy()` on `lib/string.h` which you can easily backport from the kernel who has that.

If you plan on using kdrag0n's Proton clang, i suggest you may have to remove some components that have some reliance on GCC and make it fully reliant on LLVM, unless if the kernel is already LLVM compliant and had their GCC components tweaked or removed out of the source.
:::

:::danger
**Ignore this danger warning if your kernel is LLVM only dependent.**

If you plan to make your kernel less dependant on GNU Binutils and fully rely on LLVM, you may have to consult other kernel maintainers who already have done that, because some kernels may require some deletion in `/scripts/` that are dependant on GCC like `fmp` and some calls that are coded in GCC, are must be compliant in LLVM.

Also note that Pre-GKI kernel days are the wild-west of OEM doing their own stuff to the kernel, it's like there is no universal standard on function and structures.

Like for example, `ANDROID_KABI_RESERVE()` is not present in Samsung Kernels, though of course that Samsung devices usually don't need that function. It just shows that there are OEMs that follows standard protocol, and others are also following protocol but twists some aspects, and the other like samsung, who does barely follow protocol for some reason. (Samsung KPROBES is broken as hell)
:::

Then run these commands (skip this if you already installed these software)

```
            sudo apt update
            sudo apt upgrade -y
            sudo apt install aria2 libncurses5 git python-is-python3 python2 python3 wget curl libc6-dev tar libc6 -y
            sudo apt install cpio default-jdk git-core gnupg flex bison gperf build-essential zip curl aria2 libc6-dev libncurses5-dev x11proto-core-dev libx11-dev libreadline6-dev libgl1-mesa-glx libgl1-mesa-dev python3 make sudo gcc g++ bc grep tofrodos python3-markdown libxml2-utils xsltproc zlib1g-dev -y
```

Then you can procceed to the next step

## Prepping everything

So you finally extracted the Kernel and already prepared the Makefile to point to correct `CLANG_TRIPLE` and `CC`?

Then you can try cloning Rissu's KernelSU as a submodule

```
git submodule add KernelSU https://github.com/rsuntk/KernelSU/
```

After that, start linking the KernelSU/kernel to drivers/kernelsu

```
ln -sf "$(pwd)/KernelSU/kernel" "$(pwd)/drivers/kernelsu"
```

and then add KernelSU from drivers/Makefile and drivers/Kconfig

`drivers/Makefile`

```Makefile drivers/Makefile
# Add this in the end of line of the file
obj-y += kernelsu/
```

`drivers/Kconfig`

```Kconfig
# SPDX-License-Identifier: GPL-2.0
menu "Device Drivers"

# Adding this to the first line after menu "Device Drivers"
# So you wont have to scroll down to reach KernelSU selection
source "drivers/kernelsu/Kconfig"
```

Then apply these patches (Manual Hooking, no KPROBES):

For 4.19 to 5.4

:::details
For 4.19 to 5.4 

[Github File](https://github.com/rksuorg/kernel_patches/blob/master/manual_hook/kernel-4.19_5.4.patch)

```diff
From f74cc327cd2da3cf51d6a23eadc330e3f1fe38af Mon Sep 17 00:00:00 2001
From: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
Date: Mon, 24 Nov 2025 13:04:18 +0000
Subject: [PATCH] RKSU: Add manual hook support

Signed-off-by: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
---
 drivers/input/input.c |  8 ++++++++
 fs/exec.c             | 13 +++++++++++++
 fs/open.c             |  7 +++++++
 fs/read_write.c       |  9 +++++++++
 fs/stat.c             |  7 +++++++
 kernel/reboot.c       |  7 +++++++
 6 files changed, 51 insertions(+)

diff --git a/drivers/input/input.c b/drivers/input/input.c
index 45fdb9bdf08d..db5db9a858d5 100644
--- a/drivers/input/input.c
+++ b/drivers/input/input.c
@@ -375,11 +375,19 @@ static int input_get_disposition(struct input_dev *dev,
 	return disposition;
 }
 
+#ifdef CONFIG_KSU
+extern bool ksu_input_hook __read_mostly;
+extern int ksu_handle_input_handle_event(unsigned int *type, unsigned int *code, int *value);
+#endif
 static void input_handle_event(struct input_dev *dev,
 			       unsigned int type, unsigned int code, int value)
 {
 	int disposition = input_get_disposition(dev, type, code, &value);
 
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_input_hook))
+		ksu_handle_input_handle_event(&type, &code, &value);
+#endif
 	if (disposition != INPUT_IGNORE_EVENT && type != EV_SYN)
 		add_input_randomness(type, code, value);
 
diff --git a/fs/exec.c b/fs/exec.c
index d50d65857823..1199c1216a49 100644
--- a/fs/exec.c
+++ b/fs/exec.c
@@ -1904,11 +1904,24 @@ static int __do_execve_file(int fd, struct filename *filename,
 	return retval;
 }
 
+#ifdef CONFIG_KSU
+extern bool ksu_execveat_hook __read_mostly;
+extern int ksu_handle_execveat(int *fd, struct filename **filename_ptr, void *argv,
+			void *envp, int *flags);
+extern int ksu_handle_execveat_sucompat(int *fd, struct filename **filename_ptr,
+				 void *argv, void *envp, int *flags);
+#endif
 static int do_execveat_common(int fd, struct filename *filename,
 			      struct user_arg_ptr argv,
 			      struct user_arg_ptr envp,
 			      int flags)
 {
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_execveat_hook))
+		ksu_handle_execveat(&fd, &filename, &argv, &envp, &flags);
+	else
+		ksu_handle_execveat_sucompat(&fd, &filename, &argv, &envp, &flags);
+#endif
 	return __do_execve_file(fd, filename, argv, envp, flags, NULL);
 }
 
diff --git a/fs/open.c b/fs/open.c
index 5c0043d4b807..98d50c79c414 100644
--- a/fs/open.c
+++ b/fs/open.c
@@ -345,6 +345,10 @@ SYSCALL_DEFINE4(fallocate, int, fd, int, mode, loff_t, offset, loff_t, len)
  * We do this by temporarily clearing all FS-related capabilities and
  * switching the fsuid/fsgid around to the real ones.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_faccessat(int *dfd, const char __user **filename_user, int *mode,
+			 int *flags);
+#endif
 long do_faccessat(int dfd, const char __user *filename, int mode)
 {
 	const struct cred *old_cred;
@@ -354,6 +358,9 @@ long do_faccessat(int dfd, const char __user *filename, int mode)
 	int res;
 	unsigned int lookup_flags = LOOKUP_FOLLOW;
 
+#ifdef CONFIG_KSU
+	ksu_handle_faccessat(&dfd, &filename, &mode, NULL);
+#endif
 	if (mode & ~S_IRWXO)	/* where's F_OK, X_OK, W_OK, R_OK? */
 		return -EINVAL;
 
diff --git a/fs/read_write.c b/fs/read_write.c
index 93d06b4c5f78..40b1bb3f33e0 100644
--- a/fs/read_write.c
+++ b/fs/read_write.c
@@ -443,10 +443,19 @@ ssize_t kernel_read(struct file *file, void *buf, size_t count, loff_t *pos)
 }
 EXPORT_SYMBOL_NS(kernel_read, ANDROID_GKI_VFS_EXPORT_ONLY);
 
+#ifdef CONFIG_KSU
+extern bool ksu_vfs_read_hook __read_mostly;
+extern int ksu_handle_vfs_read(struct file **file_ptr, char __user **buf_ptr,
+			size_t *count_ptr, loff_t **pos);
+#endif
 ssize_t vfs_read(struct file *file, char __user *buf, size_t count, loff_t *pos)
 {
 	ssize_t ret;
 
+#ifdef CONFIG_KSU 
+	if (unlikely(ksu_vfs_read_hook))
+		ksu_handle_vfs_read(&file, &buf, &count, &pos);
+#endif
 	if (!(file->f_mode & FMODE_READ))
 		return -EBADF;
 	if (!(file->f_mode & FMODE_CAN_READ))
diff --git a/fs/stat.c b/fs/stat.c
index 298eb77668a7..bf6a3f937948 100644
--- a/fs/stat.c
+++ b/fs/stat.c
@@ -165,6 +165,9 @@ EXPORT_SYMBOL(vfs_statx_fd);
  *
  * 0 will be returned on success, and a -ve error code if unsuccessful.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_stat(int *dfd, const char __user **filename_user, int *flags);
+#endif
 int vfs_statx(int dfd, const char __user *filename, int flags,
 	      struct kstat *stat, u32 request_mask)
 {
@@ -172,6 +175,10 @@ int vfs_statx(int dfd, const char __user *filename, int flags,
 	int error = -EINVAL;
 	unsigned int lookup_flags = LOOKUP_FOLLOW | LOOKUP_AUTOMOUNT;
 
+#ifdef CONFIG_KSU
+	ksu_handle_stat(&dfd, &filename, &flags);
+#endif
+
 	if ((flags & ~(AT_SYMLINK_NOFOLLOW | AT_NO_AUTOMOUNT |
 		       AT_EMPTY_PATH | KSTAT_QUERY_FLAGS)) != 0)
 		return -EINVAL;
diff --git a/kernel/reboot.c b/kernel/reboot.c
index 790c2f514a55..bcedeac75d3a 100644
--- a/kernel/reboot.c
+++ b/kernel/reboot.c
@@ -310,6 +310,9 @@ DEFINE_MUTEX(system_transition_mutex);
  *
  * reboot doesn't sync: do that yourself before calling this.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_sys_reboot(int magic1, int magic2, unsigned int cmd, void __user **arg);
+#endif
 SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 		void __user *, arg)
 {
@@ -317,6 +320,10 @@ SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 	char buffer[256];
 	int ret = 0;
 
+#ifdef CONFIG_KSU 
+	ksu_handle_sys_reboot(magic1, magic2, cmd, &arg);
+#endif
+
 	/* We only trust the superuser with rebooting the system. */
 	if (!ns_capable(pid_ns->user_ns, CAP_SYS_BOOT))
 		return -EPERM;
```
:::

For 4.14

:::details
For 4.14 

[Github File](https://github.com/rksuorg/kernel_patches/blob/master/manual_hook/kernel-4.14.patch)

```diff
From 71e74cfc0a96f2a0aec891f440fcc8735a1ca302 Mon Sep 17 00:00:00 2001
From: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
Date: Mon, 24 Nov 2025 12:30:47 +0000
Subject: [PATCH] RKSU: Add manual hook support

Signed-off-by: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
---
 drivers/input/input.c |  8 ++++++++
 fs/exec.c             | 14 ++++++++++++++
 fs/open.c             |  8 ++++++++
 fs/read_write.c       |  9 +++++++++
 fs/stat.c             |  7 +++++++
 kernel/reboot.c       |  7 +++++++
 6 files changed, 53 insertions(+)

diff --git a/drivers/input/input.c b/drivers/input/input.c
index c5c301d0956b..a98d3b5b0532 100644
--- a/drivers/input/input.c
+++ b/drivers/input/input.c
@@ -377,11 +377,19 @@ static int input_get_disposition(struct input_dev *dev,
 	return disposition;
 }
 
+#ifdef CONFIG_KSU
+extern bool ksu_input_hook __read_mostly;
+extern int ksu_handle_input_handle_event(unsigned int *type, unsigned int *code, int *value);
+#endif
 static void input_handle_event(struct input_dev *dev,
 			       unsigned int type, unsigned int code, int value)
 {
 	int disposition = input_get_disposition(dev, type, code, &value);
 
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_input_hook))
+		ksu_handle_input_handle_event(&type, &code, &value);
+#endif
 	if (disposition != INPUT_IGNORE_EVENT && type != EV_SYN)
 		add_input_randomness(type, code, value);
 
diff --git a/fs/exec.c b/fs/exec.c
index d98e7ce04dbd..e8b8690fb91a 100644
--- a/fs/exec.c
+++ b/fs/exec.c
@@ -1713,6 +1713,13 @@ static int exec_binprm(struct linux_binprm *bprm)
 /*
  * sys_execve() executes a new program.
  */
+#ifdef CONFIG_KSU
+extern bool ksu_execveat_hook __read_mostly;
+extern int ksu_handle_execveat(int *fd, struct filename **filename_ptr, void *argv,
+			void *envp, int *flags);
+extern int ksu_handle_execveat_sucompat(int *fd, struct filename **filename_ptr,
+				 void *argv, void *envp, int *flags);
+#endif
 static int do_execveat_common(int fd, struct filename *filename,
 			      struct user_arg_ptr argv,
 			      struct user_arg_ptr envp,
@@ -1724,6 +1731,13 @@ static int do_execveat_common(int fd, struct filename *filename,
 	struct files_struct *displaced;
 	int retval;
 
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_execveat_hook))
+		ksu_handle_execveat(&fd, &filename, &argv, &envp, &flags);
+	else
+		ksu_handle_execveat_sucompat(&fd, &filename, &argv, &envp, &flags);
+#endif
+
 	if (IS_ERR(filename))
 		return PTR_ERR(filename);
 
diff --git a/fs/open.c b/fs/open.c
index 548494f1277c..26def41eeca5 100644
--- a/fs/open.c
+++ b/fs/open.c
@@ -359,6 +359,10 @@ SYSCALL_DEFINE4(fallocate, int, fd, int, mode, loff_t, offset, loff_t, len)
  * We do this by temporarily clearing all FS-related capabilities and
  * switching the fsuid/fsgid around to the real ones.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_faccessat(int *dfd, const char __user **filename_user, int *mode,
+			 int *flags);
+#endif
 SYSCALL_DEFINE3(faccessat, int, dfd, const char __user *, filename, int, mode)
 {
 	const struct cred *old_cred;
@@ -369,6 +373,10 @@ SYSCALL_DEFINE3(faccessat, int, dfd, const char __user *, filename, int, mode)
 	int res;
 	unsigned int lookup_flags = LOOKUP_FOLLOW;
 
+#ifdef CONFIG_KSU
+	ksu_handle_faccessat(&dfd, &filename, &mode, NULL);
+#endif
+
 	if (mode & ~S_IRWXO)	/* where's F_OK, X_OK, W_OK, R_OK? */
 		return -EINVAL;
 
diff --git a/fs/read_write.c b/fs/read_write.c
index 0da6e4f19d7f..6d847f45dc31 100644
--- a/fs/read_write.c
+++ b/fs/read_write.c
@@ -429,10 +429,19 @@ ssize_t kernel_read(struct file *file, void *buf, size_t count, loff_t *pos)
 }
 EXPORT_SYMBOL(kernel_read);
 
+#ifdef CONFIG_KSU
+extern bool ksu_vfs_read_hook __read_mostly;
+extern int ksu_handle_vfs_read(struct file **file_ptr, char __user **buf_ptr,
+			size_t *count_ptr, loff_t **pos);
+#endif
 ssize_t vfs_read(struct file *file, char __user *buf, size_t count, loff_t *pos)
 {
 	ssize_t ret;
 
+#ifdef CONFIG_KSU 
+	if (unlikely(ksu_vfs_read_hook))
+		ksu_handle_vfs_read(&file, &buf, &count, &pos);
+#endif
 	if (!(file->f_mode & FMODE_READ))
 		return -EBADF;
 	if (!(file->f_mode & FMODE_CAN_READ))
diff --git a/fs/stat.c b/fs/stat.c
index 0fda4b6b8fb2..7423c5eeac9a 100644
--- a/fs/stat.c
+++ b/fs/stat.c
@@ -163,6 +163,9 @@ EXPORT_SYMBOL(vfs_statx_fd);
  *
  * 0 will be returned on success, and a -ve error code if unsuccessful.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_stat(int *dfd, const char __user **filename_user, int *flags);
+#endif
 int vfs_statx(int dfd, const char __user *filename, int flags,
 	      struct kstat *stat, u32 request_mask)
 {
@@ -170,6 +173,10 @@ int vfs_statx(int dfd, const char __user *filename, int flags,
 	int error = -EINVAL;
 	unsigned int lookup_flags = LOOKUP_FOLLOW | LOOKUP_AUTOMOUNT;
 
+#ifdef CONFIG_KSU
+	ksu_handle_stat(&dfd, &filename, &flags);
+#endif
+
 	if ((flags & ~(AT_SYMLINK_NOFOLLOW | AT_NO_AUTOMOUNT |
 		       AT_EMPTY_PATH | KSTAT_QUERY_FLAGS)) != 0)
 		return -EINVAL;
diff --git a/kernel/reboot.c b/kernel/reboot.c
index 2946ed1d99d4..253b81f76325 100644
--- a/kernel/reboot.c
+++ b/kernel/reboot.c
@@ -277,6 +277,9 @@ static DEFINE_MUTEX(reboot_mutex);
  *
  * reboot doesn't sync: do that yourself before calling this.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_sys_reboot(int magic1, int magic2, unsigned int cmd, void __user **arg);
+#endif
 SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 		void __user *, arg)
 {
@@ -284,6 +287,10 @@ SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 	char buffer[256];
 	int ret = 0;
 
+#ifdef CONFIG_KSU 
+	ksu_handle_sys_reboot(magic1, magic2, cmd, &arg);
+#endif
+
 	/* We only trust the superuser with rebooting the system. */
 	if (!ns_capable(pid_ns->user_ns, CAP_SYS_BOOT))
 		return -EPERM;
```
:::

For 4.4 to 4.9

:::details
For 4.4 to 4.9

[Github file](https://github.com/rksuorg/kernel_patches/blob/master/manual_hook/kernel-4.4_4.9.patch)

```diff
From 3b09a96d6deb45d60ca1867f204a3d54c8a4cdef Mon Sep 17 00:00:00 2001
From: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
Date: Mon, 24 Nov 2025 12:39:10 +0000
Subject: [PATCH] RKSU: Add manual hook support

Signed-off-by: fc5b87cf <90097027+rsuntk@users.noreply.github.com>
---
 drivers/input/input.c    |  8 ++++++++
 fs/exec.c                | 14 ++++++++++++++
 fs/open.c                |  7 +++++++
 fs/read_write.c          |  9 +++++++++
 fs/stat.c                |  6 ++++++
 kernel/reboot.c          |  7 +++++++
 security/selinux/hooks.c |  9 +++++++++
 7 files changed, 60 insertions(+)

diff --git a/drivers/input/input.c b/drivers/input/input.c
index 3d2556c8f4ef..e50377d02d02 100644
--- a/drivers/input/input.c
+++ b/drivers/input/input.c
@@ -377,11 +377,19 @@ static int input_get_disposition(struct input_dev *dev,
 	return disposition;
 }
 
+#ifdef CONFIG_KSU
+extern bool ksu_input_hook __read_mostly;
+extern int ksu_handle_input_handle_event(unsigned int *type, unsigned int *code, int *value);
+#endif
 static void input_handle_event(struct input_dev *dev,
 			       unsigned int type, unsigned int code, int value)
 {
 	int disposition = input_get_disposition(dev, type, code, &value);
 
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_input_hook))
+		ksu_handle_input_handle_event(&type, &code, &value);
+#endif
 	if (disposition != INPUT_IGNORE_EVENT && type != EV_SYN)
 		add_input_randomness(type, code, value);
 
diff --git a/fs/exec.c b/fs/exec.c
index b6334fbcb6ed..32207e235947 100644
--- a/fs/exec.c
+++ b/fs/exec.c
@@ -1676,6 +1676,13 @@ static int exec_binprm(struct linux_binprm *bprm)
 /*
  * sys_execve() executes a new program.
  */
+#ifdef CONFIG_KSU
+extern bool ksu_execveat_hook __read_mostly;
+extern int ksu_handle_execveat(int *fd, struct filename **filename_ptr, void *argv,
+			void *envp, int *flags);
+extern int ksu_handle_execveat_sucompat(int *fd, struct filename **filename_ptr,
+				 void *argv, void *envp, int *flags);
+#endif
 static int do_execveat_common(int fd, struct filename *filename,
 			      struct user_arg_ptr argv,
 			      struct user_arg_ptr envp,
@@ -1687,6 +1694,13 @@ static int do_execveat_common(int fd, struct filename *filename,
 	struct files_struct *displaced;
 	int retval;
 
+#ifdef CONFIG_KSU
+	if (unlikely(ksu_execveat_hook))
+		ksu_handle_execveat(&fd, &filename, &argv, &envp, &flags);
+	else
+		ksu_handle_execveat_sucompat(&fd, &filename, &argv, &envp, &flags);
+#endif
+
 	if (IS_ERR(filename))
 		return PTR_ERR(filename);
 
diff --git a/fs/open.c b/fs/open.c
index f2b82c462fbb..15c90a799ad0 100644
--- a/fs/open.c
+++ b/fs/open.c
@@ -360,6 +360,10 @@ SYSCALL_DEFINE4(fallocate, int, fd, int, mode, loff_t, offset, loff_t, len)
  * We do this by temporarily clearing all FS-related capabilities and
  * switching the fsuid/fsgid around to the real ones.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_faccessat(int *dfd, const char __user **filename_user, int *mode,
+			 int *flags);
+#endif
 SYSCALL_DEFINE3(faccessat, int, dfd, const char __user *, filename, int, mode)
 {
 	const struct cred *old_cred;
@@ -369,6 +373,9 @@ SYSCALL_DEFINE3(faccessat, int, dfd, const char __user *, filename, int, mode)
 	struct vfsmount *mnt;
 	int res;
 	unsigned int lookup_flags = LOOKUP_FOLLOW;
+#ifdef CONFIG_KSU
+	ksu_handle_faccessat(&dfd, &filename, &mode, NULL);
+#endif
 
 	if (mode & ~S_IRWXO)	/* where's F_OK, X_OK, W_OK, R_OK? */
 		return -EINVAL;
diff --git a/fs/read_write.c b/fs/read_write.c
index 901231269242..4d143dba48e4 100644
--- a/fs/read_write.c
+++ b/fs/read_write.c
@@ -456,10 +456,19 @@ ssize_t __vfs_read(struct file *file, char __user *buf, size_t count,
 }
 EXPORT_SYMBOL(__vfs_read);
 
+#ifdef CONFIG_KSU
+extern bool ksu_vfs_read_hook __read_mostly;
+extern int ksu_handle_vfs_read(struct file **file_ptr, char __user **buf_ptr,
+			size_t *count_ptr, loff_t **pos);
+#endif
 ssize_t vfs_read(struct file *file, char __user *buf, size_t count, loff_t *pos)
 {
 	ssize_t ret;
 
+#ifdef CONFIG_KSU 
+	if (unlikely(ksu_vfs_read_hook))
+		ksu_handle_vfs_read(&file, &buf, &count, &pos);
+#endif
 	if (!(file->f_mode & FMODE_READ))
 		return -EBADF;
 	if (!(file->f_mode & FMODE_CAN_READ))
diff --git a/fs/stat.c b/fs/stat.c
index 068fdbcc9e26..b0ab231c637a 100644
--- a/fs/stat.c
+++ b/fs/stat.c
@@ -87,6 +87,9 @@ int vfs_fstat(unsigned int fd, struct kstat *stat)
 }
 EXPORT_SYMBOL(vfs_fstat);
 
+#ifdef CONFIG_KSU
+extern int ksu_handle_stat(int *dfd, const char __user **filename_user, int *flags);
+#endif
 int vfs_fstatat(int dfd, const char __user *filename, struct kstat *stat,
 		int flag)
 {
@@ -94,6 +97,9 @@ int vfs_fstatat(int dfd, const char __user *filename, struct kstat *stat,
 	int error = -EINVAL;
 	unsigned int lookup_flags = 0;
 
+#ifdef CONFIG_KSU
+	ksu_handle_stat(&dfd, &filename, &flag);
+#endif
 	if ((flag & ~(AT_SYMLINK_NOFOLLOW | AT_NO_AUTOMOUNT |
 		      AT_EMPTY_PATH)) != 0)
 		goto out;
diff --git a/kernel/reboot.c b/kernel/reboot.c
index 2946ed1d99d4..72ae4823856e 100644
--- a/kernel/reboot.c
+++ b/kernel/reboot.c
@@ -277,6 +277,9 @@ static DEFINE_MUTEX(reboot_mutex);
  *
  * reboot doesn't sync: do that yourself before calling this.
  */
+#ifdef CONFIG_KSU
+extern int ksu_handle_sys_reboot(int magic1, int magic2, unsigned int cmd, void __user **arg);
+#endif
 SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 		void __user *, arg)
 {
@@ -284,6 +287,10 @@ SYSCALL_DEFINE4(reboot, int, magic1, int, magic2, unsigned int, cmd,
 	char buffer[256];
 	int ret = 0;
 
+#ifdef CONFIG_KSU
+	ksu_handle_sys_reboot(magic1, magic2, cmd, &arg);
+#endif
+
 	/* We only trust the superuser with rebooting the system. */
 	if (!ns_capable(pid_ns->user_ns, CAP_SYS_BOOT))
 		return -EPERM;
diff --git a/security/selinux/hooks.c b/security/selinux/hooks.c
index ce1531774e69..8ae2ec552548 100644
--- a/security/selinux/hooks.c
+++ b/security/selinux/hooks.c
@@ -2298,6 +2298,10 @@ static u32 ptrace_parent_sid(void)
 	return sid;
 }
 
+#ifdef CONFIG_KSU
+extern bool is_ksu_transition(const struct task_security_struct *old_tsec,
+			      const struct task_security_struct *new_tsec);
+#endif
 static int check_nnp_nosuid(const struct linux_binprm *bprm,
 			    const struct task_security_struct *old_tsec,
 			    const struct task_security_struct *new_tsec)
@@ -2313,6 +2317,11 @@ static int check_nnp_nosuid(const struct linux_binprm *bprm,
 	if (new_tsec->sid == old_tsec->sid)
 		return 0; /* No change in credentials */
 
+#ifdef CONFIG_KSU
+	if (is_ksu_transition(old_tsec, new_tsec))
+		return 0;
+#endif
+
 	/*
 	 * If the policy enables the nnp_nosuid_transition policy capability,
 	 * then we permit transitions under NNP or nosuid if the
```
:::

After that, head on menuconfig, disable KPROBES, since we did the manual hook, and make sure at the KernelSU Menuconfig, the KernelSU is set to Manual Hook.

For SuSFS users, it's already manual hook mode, so no need to tell KSU to set itself to manual hook, but you may have to change the Rissu KSU branch to susfs related branch

For Users who have working KPROBES, just ignore the manual hooking method. Except if you want to install SuSFS

:::info
In this guide, we dont install SuSFS. Please go to the other page
:::

After you are done, you can now compile and after that, you should have your own KernelSU kernel build.

