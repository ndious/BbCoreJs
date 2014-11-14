define(
    [
        'tb.component/formbuilder/form/element/views/form.element.view.textarea',
        'tb.component/formbuilder/form/element/Textarea',
        'text!tb.component/formbuilder/form/element/templates/textarea.twig'
    ],
    function (view, TextConstructor, template) {

        'use strict';

        describe('Testing ElementTextarea', function () {

            var config = {
                    type: 'textarea',
                    rows: 10,
                    label: 'My textarea'
                },
                formTag = 'hZ1e',
                element = new TextConstructor('textarea', config, formTag, view, template);

            it('Testing initialize', function () {

                expect(element.getRows()).toEqual(config.rows);
                expect(element.template.length).toBeGreaterThan(0);
            });

            it('Testing render', function () {

                expect(element.render().length).toBeGreaterThan(0);
            });
        });
    }
);