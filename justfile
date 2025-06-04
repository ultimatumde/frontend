init:
    meson setup build

reinit:
    meson setup --reconfigure build

build:
    meson compile -C build