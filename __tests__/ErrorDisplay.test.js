import React from "react"
import renderer from "react-test-renderer"
import ErrorDisplay from "../src/admin/components/ErrorDisplay"

describe("ErrorDisplay", () => {
  test("renders with default message", () => {
    const tree = renderer.create(<ErrorDisplay />).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Failed to load data")
  })

  test("renders with custom message", () => {
    const tree = renderer.create(<ErrorDisplay message="Custom error" />).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Custom error")
  })

  test("renders retry button when onRetry provided", () => {
    const tree = renderer.create(<ErrorDisplay onRetry={jest.fn()} />).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Retry")
  })

  test("no retry button when onRetry not provided", () => {
    const tree = renderer.create(<ErrorDisplay />).toJSON()
    expect(JSON.stringify(tree)).not.toContain("Retry")
  })
})
