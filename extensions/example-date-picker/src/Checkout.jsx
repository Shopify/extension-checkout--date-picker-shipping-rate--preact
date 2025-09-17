import '@shopify/ui-extensions/preact';
import {render} from "preact";
import { useState, useCallback, useMemo } from "preact/hooks";
 import {
   useApplyMetafieldsChange,
   useDeliveryGroupListTarget,
   useApi,
} from "@shopify/ui-extensions/checkout/preact";


// 1. Export the extension
export default function() {
  render(<Extension />, document.body)
}

function Extension() {
  const [selectedDate, setSelectedDate] = useState("");
  const [yesterday, setYesterday] = useState("");

  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  // Get the delivery group list
  const deliveryGroupList = useDeliveryGroupListTarget();

  // Define the metafield namespace and key
  const metafieldNamespace = "yourAppNamespace";
  const metafieldKey = "deliverySchedule";

  // Sets the selected date to today, unless today is Sunday, then it sets it to tomorrow
  useMemo(() => {
    let today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const deliveryDate = today.getDay() === 0 ? tomorrow : today;

    setSelectedDate(formatDate(deliveryDate));
    setYesterday(formatDate(yesterday));
  }, []);

  // Set a function to handle the Date Picker component's onChange event
  const handleChangeDate = useCallback((event) => {
    const selectedDate = event.target.value;
    setSelectedDate(selectedDate);

    // Apply the change to the metafield
    applyMetafieldsChange({
      type: selectedDate ? "updateMetafield" : "removeMetafield",
      namespace: metafieldNamespace,
      key: metafieldKey,
      valueType: "string",
      value: selectedDate,
    });
  }, []);

  // Guard against duplicate rendering of `shipping-option-list.render-after` target for one-time purchase and subscription sections. Calling `applyMetafieldsChange()` on the same namespace-key pair from duplicated extensions would otherwise cause an overwrite of the metafield value.
  // Instead of guarding, another approach would be to prefix the metafield key when calling `applyMetafieldsChange()`. The `deliveryGroupList`'s `groupType` could be used to such effect.
  if (!deliveryGroupList || deliveryGroupList.groupType !== 'oneTimePurchase') {
    return null;
  }

  const { deliveryGroups } = deliveryGroupList;

  // Function to compute if Express is selected in any of the delivery groups
  let isExpressSelected = () => {
    const expressHandles = new Set(
      deliveryGroups
        .map(
          ({deliveryOptions}) =>
            deliveryOptions.find(({ title }) => title === "Express")?.handle,
        )
        .filter(Boolean),
    );
    return deliveryGroups.some(({ selectedDeliveryOption }) =>
      expressHandles.has(selectedDeliveryOption?.handle),
    );
  };

  return (isExpressSelected() ? (
    <>
      <s-heading>Select a date for delivery</s-heading>
      <s-date-picker
        value={selectedDate}
        onChange={handleChangeDate}
        disallow={`--${yesterday}`}
        disallowDays="sunday"
      />
    </>
  ) : null);
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
