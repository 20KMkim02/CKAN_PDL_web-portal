from setuptools import setup, find_namespace_packages

setup(
    name='ckanext-nexttheme',
    version='0.1.0',
    description='CKAN theme extension (next theme) for Thailand province portal',
    packages=find_namespace_packages(include=['ckanext.*']),
    namespace_packages=['ckanext'],
    include_package_data=True,
    zip_safe=False,
    entry_points='''
        [ckan.plugins]
        nexttheme = ckanext.nexttheme.plugin:NextThemePlugin
    ''',
)
