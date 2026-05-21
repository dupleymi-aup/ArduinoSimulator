import React from "react"
import renderer from "react-test-renderer"
import StatCard from "../src/admin/components/StatCard"

describe("StatCard", () => {
  test("renders with required props", () => {
    const tree = renderer.create(<StatCard title="Test" value={42} />).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Test")
    expect(JSON.stringify(tree)).toContain("42")
  })

  test("renders with subtitle", () => {
    const tree = renderer.create(
      <StatCard title="Test" value={42} subtitle="Details here" />
    ).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("Details here")
  })

  test("renders with custom color", () => {
    const tree = renderer.create(
      <StatCard title="Test" value={42} color="#ff0000" />
    ).toJSON()
    expect(tree).toBeTruthy()
  })

  test("renders string value", () => {
    const tree = renderer.create(<StatCard title="Rate" value="85%" />).toJSON()
    expect(tree).toBeTruthy()
    expect(JSON.stringify(tree)).toContain("85%")
  })
})
