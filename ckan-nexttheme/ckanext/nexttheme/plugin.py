import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckanext.nexttheme import helpers as nexttheme_helpers


class NextThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.ITemplateHelpers)

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_resource('assets', 'nexttheme')
        toolkit.add_public_directory(config_, 'public')

    def get_helpers(self):
        return {
            'nexttheme_province_cards': nexttheme_helpers.get_province_cards_data,
        }

