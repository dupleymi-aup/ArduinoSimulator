import React from "react"
import renderer from "react-test-renderer"
import AdminErrorBoundary from "../src/admin/AdminErrorBoundary"

describe("AdminErrorBoundary", () => {
  it("renders children when no error", () => {
    const tree = renderer
      .create(
        <AdminErrorBoundary>
          <div>Normal content</div>
        </AdminErrorBoundary>
      )
      .toJSON()

    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Normal content")
  })

  it("renders error state when child throws", () => {
    const Thrower = () => {
      throw new Error("Test error")
    }

    // Suppress console.error from the error boundary
    jest.spyOn(console, "error").mockImplementation(() => {})

    const tree = renderer
      .create(
        <AdminErrorBoundary>
          <Thrower />
        </AdminErrorBoundary>
      )
      .toJSON()

    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Something went wrong")

    console.error.mockRestore()
  })
})
