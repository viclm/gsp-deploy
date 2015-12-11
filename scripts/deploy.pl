#!/usr/bin/perl

use IPC::Open3;

@files = ('nx/core/app/publisher.js');

$pid = open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR, 'gsp-deploy ready');
waitpid($pid, 0);
my $child_exit_status = $? >> 8;
if ($child_exit_status == 0) {
    foreach $file(@files) {
        $pid = open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR, "gsp-deploy $file");
        waitpid($pid, 0);
        my $child_exit_status = $? >> 8;
        if ($child_exit_status == 0) {
            print <CHLD_OUT>;
        }
        else {
            print <CHLD_ERR>;
        }
    }
}
else {
    print <CHLD_ERR>;
}
