import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';

const source = `
# How to Use 

**1. Setup**
   - Must have **React Testing Library** installed
   - Must have **React DevTools** extension installed
   - Must be in developer mode (no minification or uglification)
   
**2. Create Unit Tests**
   - Select the component you want to create tests for
   - Give the test a name
   - Start recording your actions while interacting with the component
   - Press Stop to finish the capture for events and voila, your test is magically created
   - Edit import statements as needed
   - Copy the tests you've created

## Additional Information
- GitHub: **github.com/pcosv/Examin**
- Contact: **paula.vazsouza@gmail.com** 



        `;

function Howto() {
	return (
		<div>
			<MarkdownPreview source={source} />
		</div>
	);
}

export default Howto;
