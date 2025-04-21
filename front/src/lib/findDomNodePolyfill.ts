import * as ReactDOM from 'react-dom';
import { findDOMNode } from 'find-dom-node-polyfill';

if (typeof (ReactDOM as any).findDOMNode !== 'function') {
  (ReactDOM as any).findDOMNode = findDOMNode;
}
