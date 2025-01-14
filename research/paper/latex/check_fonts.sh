#!/bin/bash
echo "Checking for Japanese fonts..."
fc-list | grep -i "ipa"
fc-list | grep -i "noto.*cjk"
