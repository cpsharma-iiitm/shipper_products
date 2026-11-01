/**
 * Copy that reads differently on the phone and desktop artboards (the home and listing headings are
 * worded separately). Only the visible variant is exposed to assistive technology.
 */
export default function ResponsiveText({ desktop, mobile }) {
  return (
    <>
      <span className="d-none d-md-inline">{desktop}</span>
      <span className="d-md-none">{mobile}</span>
    </>
  )
}
