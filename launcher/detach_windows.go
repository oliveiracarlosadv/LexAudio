//go:build windows

package main

import "os/exec"

// No Windows o processo do ícone já é o servidor; nada a fazer.
func detach(cmd *exec.Cmd) {}
