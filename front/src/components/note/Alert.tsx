import { defaultProps } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';
import { Menu } from '@mantine/core';
import { MdCancel, MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

// 알림 타입 정의
export type AlertType = 'warning' | 'error' | 'info' | 'success';

// The Alert block.
export const Alert = createReactBlockSpec(
  {
    type: 'alert',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: 'warning',
        values: ['warning', 'error', 'info', 'success'],
      },
    },
    content: 'inline',
  },
  {
    render: function AlertComponent(props) {
      const alertTypes = {
        warning: { icon: MdError, color: '#e69819', title: 'Warning' },
        error: { icon: MdCancel, color: '#d80d0d', title: 'Error' },
        info: { icon: MdInfo, color: '#507aff', title: 'Info' },
        success: { icon: MdCheckCircle, color: '#0bc10b', title: 'Success' },
      };

      const alertType = alertTypes[props.block.props.type];
      const Icon = alertType.icon;

      // Tailwind classes based on alert type
      const alertClasses = {
        warning: 'bg-amber-50 dark:bg-amber-900',
        error: 'bg-red-50 dark:bg-red-900',
        info: 'bg-blue-50 dark:bg-blue-900',
        success: 'bg-green-50 dark:bg-green-900',
      };

      const iconClasses = {
        warning: 'text-amber-500',
        error: 'text-red-600',
        info: 'text-blue-500',
        success: 'text-green-500',
      };

      return (
        <div
          className={`flex justify-center items-center flex-grow rounded min-h-12 p-1 ${alertClasses[props.block.props.type]}`}
        >
          {/* Icon which opens a menu to choose the Alert type */}
          <Menu withinPortal={false}>
            <Menu.Target>
              <div
                className="rounded-2xl flex justify-center items-center mx-3 h-4.5 w-4.5 select-none cursor-pointer"
                contentEditable={false}
              >
                <Icon
                  className={`${iconClasses[props.block.props.type]}`}
                  size={32}
                />
              </div>
            </Menu.Target>
            {/* Dropdown to change the Alert type */}
            <Menu.Dropdown>
              <Menu.Label>Alert Type</Menu.Label>
              <Menu.Divider />
              {Object.entries(alertTypes).map(([value, data]) => {
                const ItemIcon = data.icon;
                // 여기서 타입 캐스팅
                const typedValue = value as AlertType;
                return (
                  <Menu.Item
                    key={value}
                    leftSection={
                      <ItemIcon className={iconClasses[typedValue]} />
                    }
                    onClick={() =>
                      props.editor.updateBlock(props.block, {
                        type: 'alert',
                        props: { type: typedValue },
                      })
                    }
                  >
                    {data.title}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
          {/* Rich text field for user to type in */}
          <div className="flex-grow" ref={props.contentRef} />
        </div>
      );
    },
  },
);
