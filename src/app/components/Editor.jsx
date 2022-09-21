import React, { useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import { Controlled as ControlledEditor } from 'react-codemirror2';
import './Editor.css';

export default function Editor(props) {
	const { language, displayName, value, onChange } = props;

	function handleChange(editor, data, value) {
		onChange(value);
	}

	return (
		<ControlledEditor
			editable={true}
			onBeforeChange={handleChange}
			value={value}
			options={{
				lineWrapping: true,
				lint: true,
				mode: language,
				theme: 'dracula',
				lineNumbers: true,
				viewportMargin: Infinity,
				scrollbarStyle: 'null',
			}}
		/>
	);
}
