project(
  'frontend',
  'cpp',
  version : '0.1',
  meson_version : '>= 1.3.0',
  default_options : ['warning_level=3', 'cpp_std=c++14'],
)

dependencies = [
]

exe = executable(
  'backend',
  'src/main.cpp',
  include_directories : include_directories('./src'),
  dependencies : dependencies,
)