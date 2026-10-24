//go:build !windows

package main

import (
	"os/exec"
	"syscall"
)

// detach separa o processo filho do processo do ícone (nova sessão).
func detach(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
}
