let data = {}
function gen(totalDepth, depth = 1, label = 64) {
  const root = { label: String.fromCharCode(label) }
  if (depth < 2) {
    root.label = 'root'
  }
  const val = d3.randomInt(1, 2)()
  if (totalDepth < depth + 1) {
    root.value = val
    return root
  }
  depth++
  const hasChild = depth > 2 ? d3.randomInt(0, 2)() : 1
  if (hasChild) {
    root.children = []
    let times = d3.randomInt(1, 11 - ((depth * 1.5) | 0))()
    while (times--) {
      if (depth === 2) label++
      const grand = gen(totalDepth, depth, label)
      root.children.push(grand)
    }
    return root
  }

  root.value = val
  return root
}
const layers = 6
const randomData = {
  label: 'root',
  children: [
    {
      label: 'A',
      children: [
        {
          label: 'A',
          children: [
            { label: 'A', children: [{ label: 'A', value: 1 }] },
            {
              label: 'A',
              children: [
                { label: 'A', children: [{ label: 'A', value: 1 }] },
                { label: 'A', children: [{ label: 'A', value: 1 }] },
                { label: 'A', value: 1 }
              ]
            },
            {
              label: 'A',
              children: [{ label: 'A', children: [{ label: 'A', value: 1 }] }]
            },
            { label: 'A', value: 1 }
          ]
        },
        { label: 'A', value: 1 },
        { label: 'A', value: 1 },
        { label: 'A', value: 1 },
        { label: 'A', value: 1 }
      ]
    },
    { label: 'B', value: 1 },
    {
      label: 'C',
      children: [
        { label: 'C', value: 1 },
        {
          label: 'C',
          children: [
            {
              label: 'C',
              children: [
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', value: 1 }
              ]
            },
            {
              label: 'C',
              children: [
                { label: 'C', value: 1 },
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', children: [{ label: 'C', value: 1 }] }
              ]
            },
            {
              label: 'C',
              children: [
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', value: 1 }
              ]
            }
          ]
        },
        {
          label: 'C',
          children: [
            {
              label: 'C',
              children: [
                { label: 'C', value: 1 },
                { label: 'C', value: 1 }
              ]
            },
            {
              label: 'C',
              children: [
                { label: 'C', children: [{ label: 'C', value: 1 }] },
                { label: 'C', value: 1 },
                { label: 'C', value: 1 }
              ]
            },
            { label: 'C', value: 1 }
          ]
        }
      ]
    },
    {
      label: 'D',
      children: [
        { label: 'D', value: 1 },
        {
          label: 'D',
          children: [
            {
              label: 'D',
              children: [
                { label: 'D', value: 1 },
                { label: 'D', children: [{ label: 'D', value: 1 }] }
              ]
            },
            { label: 'D', value: 1 },
            {
              label: 'D',
              children: [
                { label: 'D', value: 1 },
                { label: 'D', value: 1 },
                { label: 'D', children: [{ label: 'D', value: 1 }] }
              ]
            }
          ]
        },
        { label: 'D', value: 1 },
        { label: 'D', children: [{ label: 'D', value: 1 }] },
        {
          label: 'D',
          children: [
            { label: 'D', value: 1 },
            { label: 'D', value: 1 },
            { label: 'D', value: 1 }
          ]
        },
        {
          label: 'D',
          children: [
            { label: 'D', value: 1 },
            { label: 'D', value: 1 },
            {
              label: 'D',
              children: [
                { label: 'D', value: 1 },
                { label: 'D', value: 1 }
              ]
            },
            { label: 'D', value: 1 }
          ]
        }
      ]
    },
    {
      label: 'E',
      children: [
        {
          label: 'E',
          children: [
            { label: 'E', value: 1 },
            {
              label: 'E',
              children: [
                { label: 'E', children: [{ label: 'E', value: 1 }] },
                { label: 'E', children: [{ label: 'E', value: 1 }] },
                { label: 'E', value: 1 }
              ]
            },
            {
              label: 'E',
              children: [
                { label: 'E', value: 1 },
                { label: 'E', children: [{ label: 'E', value: 1 }] },
                { label: 'E', children: [{ label: 'E', value: 1 }] }
              ]
            }
          ]
        },
        {
          label: 'E',
          children: [
            { label: 'E', value: 1 },
            {
              label: 'E',
              children: [{ label: 'E', children: [{ label: 'E', value: 1 }] }]
            }
          ]
        },
        {
          label: 'E',
          children: [
            { label: 'E', value: 1 },
            { label: 'E', value: 1 }
          ]
        },
        { label: 'E', value: 1 },
        { label: 'E', value: 1 }
      ]
    },
    {
      label: 'F',
      children: [
        {
          label: 'F',
          children: [
            { label: 'F', value: 1 },
            {
              label: 'F',
              children: [
                { label: 'F', children: [{ label: 'F', value: 1 }] },
                { label: 'F', children: [{ label: 'F', value: 1 }] }
              ]
            }
          ]
        },
        { label: 'F', value: 1 },
        {
          label: 'F',
          children: [
            { label: 'F', value: 1 },
            {
              label: 'F',
              children: [{ label: 'F', children: [{ label: 'F', value: 1 }] }]
            },
            {
              label: 'F',
              children: [
                { label: 'F', children: [{ label: 'F', value: 1 }] },
                { label: 'F', value: 1 }
              ]
            }
          ]
        },
        {
          label: 'F',
          children: [
            { label: 'F', children: [{ label: 'F', value: 1 }] },
            { label: 'F', value: 1 },
            { label: 'F', value: 1 },
            { label: 'F', value: 1 }
          ]
        }
      ]
    },
    {
      label: 'G',
      children: [
        {
          label: 'G',
          children: [
            {
              label: 'G',
              children: [
                { label: 'G', children: [{ label: 'G', value: 1 }] },
                { label: 'G', children: [{ label: 'G', value: 1 }] },
                { label: 'G', children: [{ label: 'G', value: 1 }] }
              ]
            },
            {
              label: 'G',
              children: [
                { label: 'G', children: [{ label: 'G', value: 1 }] },
                { label: 'G', children: [{ label: 'G', value: 1 }] },
                { label: 'G', children: [{ label: 'G', value: 1 }] }
              ]
            },
            {
              label: 'G',
              children: [
                { label: 'G', value: 1 },
                { label: 'G', children: [{ label: 'G', value: 1 }] },
                { label: 'G', children: [{ label: 'G', value: 1 }] }
              ]
            },
            {
              label: 'G',
              children: [{ label: 'G', children: [{ label: 'G', value: 1 }] }]
            }
          ]
        },
        { label: 'G', value: 1 },
        { label: 'G', value: 1 },
        {
          label: 'G',
          children: [
            { label: 'G', value: 1 },
            { label: 'G', value: 1 },
            {
              label: 'G',
              children: [{ label: 'G', children: [{ label: 'G', value: 1 }] }]
            },
            { label: 'G', children: [{ label: 'G', value: 1 }] }
          ]
        }
      ]
    }
  ]
}
// console.log(JSON.stringify(randomData))
