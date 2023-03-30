import React from 'react';
import entries from 'object.entries';
import md from './md.jsx';
import ReactMarkdown from 'react-markdown';

interface SDKSupportTable {
    supportItems: object;
   
}
export default class SDKSupportTable extends React.Component {
    support(support, sdk) {
        if (!support) return 'Not yet supported';
        support = support[sdk];
        if (support === undefined) return 'Not yet supported';
        return `>= ${support}`;
    }

    render() {
        return (
            <div className="scroll-auto">
                <table className="txt-s">
                    <thead>
                        <tr
                            className="bg-gray-faint"
                            style={{
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px'
                            }}
                        >
                            <th style={{borderTopLeftRadius: '4px'}}>
                                SDK Support
                            </th>
                            <td>MapLibre GL JS</td>
                            <td>Android SDK</td>
                            <td>iOS SDK</td>
                            <td style={{borderTopRightRadius: '4px'}}>
                                macOS SDK
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {entries(this.props.supportItems || this.props).map(
                            ([key, entry], i) => (
                                <tr key={i}>
                                    <td><ReactMarkdown>{key}</ReactMarkdown></td>
                                    <td>{this.support(entry, 'js')}</td>
                                    <td>{this.support(entry, 'android')}</td>
                                    <td>{this.support(entry, 'ios')}</td>
                                    <td>{this.support(entry, 'macos')}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}


