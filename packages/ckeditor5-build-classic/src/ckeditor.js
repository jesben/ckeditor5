// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
//import FontColor from '@solomoto/ckeditor5-font-color/src/fontcolor'; // ckeditor-duplicated-modules: Some CKEditor 5 modules are duplicated
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// Placholder plugin
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

// Two columns
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageTwoColumnsIcon from '@ckeditor/ckeditor5-core/theme/icons/two-columns.svg';

/**
 * PLACEHOLDER
 */

class Placeholder extends Plugin {
    static get requires() {
        return [PlaceholderEditing, PlaceholderUI];
    }
}

class PlaceholderCommand extends Command {
    execute({ value }) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        editor.model.change(writer => {
            // Create a <placeholder> elment with the "name" attribute (and all the selection attributes)...
            const placeholder = writer.createElement('placeholder', {
                ...Object.fromEntries(selection.getAttributes()),
                name: value
            });

            // ... and insert it into the document.
            editor.model.insertContent(placeholder);

            // Put the selection on the inserted element.
            writer.setSelection(placeholder, 'on');
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        const isAllowed = model.schema.checkChild(selection.focus.parent, 'placeholder');

        this.isEnabled = isAllowed;
    }
}

class PlaceholderUI extends Plugin {
    init() {
        const editor = this.editor;
        const t = editor.t;
        const placeholderNames = editor.config.get('placeholderConfig.types');

        // The "placeholder" dropdown must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add('placeholder', locale => {
            const dropdownView = createDropdown(locale);

            // Populate the list in the dropdown with items.
            addListToDropdown(dropdownView, getDropdownItemsDefinitions(placeholderNames));

            dropdownView.buttonView.set({
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t('Indsæt nøgleord'),
                tooltip: true,
                withText: true
            });

            // Disable the placeholder button when the command is disabled.
            const command = editor.commands.get('placeholder');
            dropdownView.bind('isEnabled').to(command);

            // Execute the command when the dropdown item is clicked (executed).
            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute('placeholder', { value: evt.source.commandParam });
                editor.editing.view.focus();
            });

            return dropdownView;
        });
    }
}

function getDropdownItemsDefinitions(placeholderNames) {
    const itemDefinitions = new Collection();

    for (const name of placeholderNames) {
        const definition = {
            type: 'button',
            model: new Model({
                commandParam: name,
                label: name,
                withText: true
            })
        };

        // Add the item definition to the collection.
        itemDefinitions.add(definition);
    }

    return itemDefinitions;
}

class PlaceholderEditing extends Plugin {
    static get requires() {
        return [Widget];
    }

    init() {
        //console.log('PlaceholderEditing#init() got called');

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('placeholder', new PlaceholderCommand(this.editor));

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('placeholder'))
        );
        this.editor.config.define('placeholderConfig', {
            types: ['date', 'first name', 'surname']
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('placeholder', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The placeholder will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
            isObject: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            // The placeholder can have many types, like date, name, surname, etc:
            allowAttributes: ['name']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'span',
                classes: ['placeholder']
            },
            model: (viewElement, { writer: modelWriter }) => {
                // Extract the "name" from "{name}".
                const name = viewElement.getChild(0).data.slice(1, -1);

                return modelWriter.createElement('placeholder', { name });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'placeholder',
            view: (modelItem, { writer: viewWriter }) => {
                const widgetElement = createPlaceholderView(modelItem, viewWriter);

                // Enable widget handling on a placeholder element inside the editing view.
                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'placeholder',
            view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
        });

        // Helper method for both downcast converters.
        function createPlaceholderView(modelItem, viewWriter) {
            const name = modelItem.getAttribute('name');

            const placeholderView = viewWriter.createContainerElement('span', {
                class: 'placeholder'
            }, {
                isAllowedInsideAttributeElement: true
            });

            // Insert the placeholder name (as a text).
            const innerText = viewWriter.createText('{' + name + '}');
            viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);

            return placeholderView;
        }
    }
}

/**
 * TWO COLUMNS
 */

class InsertTwoColumns extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('insertTwoColumns', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Indsæt to kolonner layout',
                icon: imageTwoColumnsIcon,
                tooltip: true
            });

            // Callback executed once the image is clicked.
            view.on('execute', () => {
                editor.model.change(writer => {
                    const template = `<table cellspacing="0" cellpadding="0" style="width:100%" border="0">
                        <tr>
                            <td style="width:50%">
                                <h3>XXX</h3>
                            </td>
                            <td></td>
                            <td style="width:50%">
                                <h3>XXX</h3>
                            </td>
                        </tr>`;
                    const viewFragment = editor.data.processor.toView(template);
                    const modelFragment = editor.data.toModel(viewFragment);

                    // Insert the html in the current selection location.
                    editor.model.insertContent(modelFragment, editor.model.document.selection);
                });
            });

            return view;
        });
    }
}

/**
 * CLASSIC EDITOR
 */

class ClassicEditor extends ClassicEditorBase { }

ClassicEditor.builtinPlugins = [
    Essentials,
    UploadAdapter,
    Autoformat,
    FontColor,
    FontBackgroundColor,
    Bold,
    Italic,
    BlockQuote,
    CKFinder,
    CloudServices,
    EasyImage,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    ImageResize,
    ImageResizeEditing,
    ImageResizeHandles,
    Indent,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    TextTransformation,
    Placeholder,
    GeneralHtmlSupport,
    SourceEditing,
];

ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'uploadImage',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo',
            '|',
            'placeholder',
        ]
    },
    image: {
        resizeUnit: '%',
        resizeOptions: [
            {
                name: 'resizeImage:original',
                value: null,
                label: 'Original'
            },
            {
                name: 'resizeImage:10',
                value: '10',
                label: '10%'
            },
            {
                name: 'resizeImage:20',
                value: '20',
                label: '20%'
            },
            {
                name: 'resizeImage:30',
                value: '30',
                label: '30%'
            },
            {
                name: 'resizeImage:40',
                value: '40',
                label: '40%'
            },
            {
                name: 'resizeImage:50',
                value: '50',
                label: '50%'
            },
            {
                name: 'resizeImage:60',
                value: '60',
                label: '60%'
            },
            {
                name: 'resizeImage:70',
                value: '70',
                label: '70%'
            },
            {
                name: 'resizeImage:80',
                value: '80',
                label: '80%'
            },
            {
                name: 'resizeImage:90',
                value: '90',
                label: '90%'
            },
            {
                name: 'resizeImage:100',
                value: '100',
                label: '100%'
            }
        ],
        toolbar: [
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'toggleImageCaption',
            //'imageTextAlternative',
            'resizeImage',
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en'
};

/**
 * DECOUPLED EDITOR
 */

class DecoupledEditor extends DecoupledEditorBase { }

DecoupledEditor.builtinPlugins = [
    Essentials,
    Alignment,
    FontSize,
    FontFamily,
    FontColor,
    FontBackgroundColor,
    UploadAdapter,
    Autoformat,
    Bold,
    Italic,
    Strikethrough,
    Underline,
    BlockQuote,
    CKFinder,
    CloudServices,
    EasyImage,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    ImageResize,
    ImageResizeEditing,
    ImageResizeHandles,
    Indent,
    IndentBlock,
    Link,
    List,
    ListStyle,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    TextTransformation,
    PageBreak,
    Placeholder,
    InsertTwoColumns,
    GeneralHtmlSupport,
    SourceEditing,
];

DecoupledEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            //'fontfamily',
            'fontsize',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'numberedList',
            'bulletedList',
            '|',
            'alignment',
            'outdent',
            'indent',
            'insertTwoColumns',
            'pageBreak',
            '|',
            'link',
            'blockquote',
            'uploadImage',
            'insertTable',
            'mediaEmbed',
            '|',
            'undo',
            'redo',
            '|',
            'placeholder',
        ]
    },
    image: {
        resizeUnit: '%',
        resizeOptions: [
            {
                name: 'resizeImage:original',
                value: null,
                label: 'Original'
            },
            {
                name: 'resizeImage:10',
                value: '10',
                label: '10%'
            },
            {
                name: 'resizeImage:20',
                value: '20',
                label: '20%'
            },
            {
                name: 'resizeImage:30',
                value: '30',
                label: '30%'
            },
            {
                name: 'resizeImage:40',
                value: '40',
                label: '40%'
            },
            {
                name: 'resizeImage:50',
                value: '50',
                label: '50%'
            },
            {
                name: 'resizeImage:60',
                value: '60',
                label: '60%'
            },
            {
                name: 'resizeImage:70',
                value: '70',
                label: '70%'
            },
            {
                name: 'resizeImage:80',
                value: '80',
                label: '80%'
            },
            {
                name: 'resizeImage:90',
                value: '90',
                label: '90%'
            },
            {
                name: 'resizeImage:100',
                value: '100',
                label: '100%'
            }
        ],
        toolbar: [
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'toggleImageCaption',
            //'imageTextAlternative',
            'resizeImage',
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties'
        ]
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en'
};

// Export
export default {
    ClassicEditor, DecoupledEditor
};