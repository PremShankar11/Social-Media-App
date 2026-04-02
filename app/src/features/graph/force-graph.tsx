import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { GraphEdge, GraphNode } from '../../types/domain'

type SimNode = GraphNode & d3.SimulationNodeDatum
type SimEdge = d3.SimulationLinkDatum<SimNode> & {
  weight: number
  isDirectConnection: boolean
}

type ForceGraphProps = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  onClickNode?: (nodeId: string) => void
}

const colorScale = d3.scaleLinear<string>()
  .domain([0, 5, 15])
  .range(['#71717a', '#f97316', '#dc2626'])
  .clamp(true)

export function ForceGraph({
  nodes,
  edges,
  onClickNode,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    node: GraphNode
  } | null>(null)

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll('*').remove()

    const container = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform as string)
      })

    svg.call(zoom)

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }))
    const simEdges: SimEdge[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
      isDirectConnection: e.isDirectConnection,
    }))

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance((d) => (d.isDirectConnection ? 100 : 160))
          .strength((d) => (d.isDirectConnection ? 0.5 : 0.15)),
      )
      .force('charge', d3.forceManyBody().strength(-200).distanceMax(400))
      .force('collision', d3.forceCollide().radius(30))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Draw edges
    const edgeGroup = container
      .append('g')
      .attr('class', 'edges')
      .selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', '#a1a1aa')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)

    // Drag behavior
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragBehavior: any = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    // Draw nodes
    const nodeGroup = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(dragBehavior)

    // Node circles - colored by friend count
    nodeGroup
      .append('circle')
      .attr('r', (d) => {
        if (d.isRoot) return 20
        return Math.max(10, Math.min(d.friendCount * 1.5 + 8, 20))
      })
      .attr('fill', (d) => {
        if (d.isRoot) return '#f97316'
        return colorScale(d.friendCount)
      })
      .attr('stroke', (d) => (d.isRoot ? '#fdba74' : '#52525b'))
      .attr('stroke-width', 2)

    // Node labels (show for all nodes, but larger for root and direct friends)
    nodeGroup
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.32em')
      .attr('fill', 'white')
      .attr('font-size', (d) => {
        if (d.isRoot) return '16px'
        if (d.isDirectFriend) return '12px'
        return '10px'
      })
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .style('text-shadow', '0 0 4px rgba(0,0,0,0.9)')

    // Simple hover tooltip with connection highlighting
    let hoveredNodeId: string | null = null

    nodeGroup
      .on('mouseenter', (event, d) => {
        if (hoveredNodeId === d.id) return
        hoveredNodeId = d.id

        const [mx, my] = d3.pointer(event, svgRef.current!)
        setTooltip({ x: mx, y: my, node: d })

        // Highlight connected edges and nodes
        const connectedIds = new Set<string>([d.id])
        
        edgeGroup
          .attr('stroke-opacity', (e) => {
            const src = String(typeof e.source === 'object' ? (e.source as SimNode).id : e.source)
            const tgt = String(typeof e.target === 'object' ? (e.target as SimNode).id : e.target)
            if (src === d.id || tgt === d.id) {
              connectedIds.add(src)
              connectedIds.add(tgt)
              return 1
            }
            return 0.15
          })
          .attr('stroke-width', (e) => {
            const src = String(typeof e.source === 'object' ? (e.source as SimNode).id : e.source)
            const tgt = String(typeof e.target === 'object' ? (e.target as SimNode).id : e.target)
            return src === d.id || tgt === d.id ? 2.5 : 1.5
          })

        nodeGroup.select('circle')
          .attr('opacity', (n) => connectedIds.has((n as SimNode).id) ? 1 : 0.3)
      })
      .on('mouseleave', () => {
        hoveredNodeId = null
        setTooltip(null)

        edgeGroup
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', 1.5)

        nodeGroup.select('circle')
          .attr('opacity', 1)
      })
      .on('click', (_, d) => {
        if (!d.isRoot && onClickNode) {
          onClickNode(d.id)
        }
      })

    // Tick update
    simulation.on('tick', () => {
      edgeGroup
        .attr('x1', (d) => (d.source as SimNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimNode).y ?? 0)

      nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, onClickNode])

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        className="h-full w-full"
        style={{ minHeight: 500 }}
      />

      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-border bg-surface-raised px-4 py-3 shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <p className="text-sm font-semibold text-white">
            {tooltip.node.displayName}
          </p>
          <p className="text-xs text-zinc-500">@{tooltip.node.username}</p>
          <div className="mt-1.5 flex gap-3 text-xs text-zinc-400">
            <span>{tooltip.node.friendCount} friends</span>
            {tooltip.node.mutualConnections > 0 ? (
              <span>{tooltip.node.mutualConnections} mutual</span>
            ) : null}
          </div>
          {tooltip.node.isRoot ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-accent">
              You
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-zinc-600">
              {tooltip.node.isDirectFriend ? 'Direct friend' : 'Friend of friend'}
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
