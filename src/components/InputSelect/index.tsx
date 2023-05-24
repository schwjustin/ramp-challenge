import Downshift from "downshift";
import { useCallback, useState } from "react";
import classNames from "classnames";
import { GetDropdownPositionFn, InputSelectOnChange, InputSelectProps } from "./types";

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null);

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return;
      }

      consumerOnChange(selectedItem);
      setSelectedValue(selectedItem);
    },
    [consumerOnChange]
  );

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps();
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem);

        return (
          <div className="RampInputSelect--root">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />

            { /* move dropdown inside a relative positioned div, this allows for 
                 absolute positioning relative to the position of the input select */}
            <div style={{ position: "relative" }}>
              <div
                className="RampInputSelect--input"
                onClick={(event) => {
                  toggleProps.onClick(event);
                }}
              >
                {inputValue}
              </div>

              <div
                className={classNames("RampInputSelect--dropdown-container", {
                  "RampInputSelect--dropdown-container-opened": isOpen,
                })}
                {...getMenuProps()}
                style={{
                  top: 63,
                  left: 0,
                }}
              >
                {renderItems()}
              </div>
            </div>
          </div>
        );

        function renderItems() {
          if (!isOpen) {
            return null;
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>;
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>;
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item);
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected": parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            );
          });
        }
      }}
    </Downshift>
  );
}

// unnecessary, can use css with an extra div instead
const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) {
    const { top, left } = target.getBoundingClientRect();
    const { scrollY } = window;
    return {
      top: scrollY + top + 63,
      left,
    };
  }

  return { top: 0, left: 0 };
};
