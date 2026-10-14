import {useEffect,useMemo,useRef} from 'react'
import {Link} from 'react-router-dom'
import {Archive,Edit3,RotateCcw} from 'lucide-react'
import {AgGridReact} from 'ag-grid-react'
import {AllCommunityModule,ModuleRegistry,themeQuartz} from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])
const theme=themeQuartz.withParams({accentColor:'#105244',backgroundColor:'#ffffff',foregroundColor:'#10251f',borderColor:'#dce4df',headerBackgroundColor:'#f0f5f2',headerTextColor:'#66746f',fontFamily:'Inter, sans-serif',fontSize:13,headerFontSize:12,rowHeight:52,headerHeight:44,wrapperBorderRadius:10,selectedRowBackgroundColor:'#e5f0e9'})
const selectionOptions={mode:'multiRow',enableClickSelection:false,selectAll:'filtered'}
const defaultColumns={sortable:true,resizable:true,filter:'agTextColumnFilter',valueFormatter:({value})=>value||'—'}
const getRowId=({data})=>data.id

export default function CustomerGrid({rows,selected,onSelection,archived,onRestore,onArchive}){
  const ref=useRef(null)
  const syncing=useRef(false)
  const actions=useRef({onRestore,onArchive});actions.current={onRestore,onArchive}
  const sync=api=>{syncing.current=true;api.forEachNode(node=>{const shouldSelect=selected.has(node.data.id);if(node.isSelected()!==shouldSelect)node.setSelected(shouldSelect)});syncing.current=false}
  useEffect(()=>{if(ref.current?.api)sync(ref.current.api)},[selected,rows])
  const columns=useMemo(()=>[
    {field:'name',headerName:'Name',minWidth:180,flex:1.2,sort:'asc',cellRenderer:({value})=><strong>{value}</strong>},
    {field:'phone',headerName:'Phone',minWidth:150,flex:1},
    {field:'email',headerName:'Email',minWidth:180,flex:1.2},
    {field:'pan',headerName:'PAN',minWidth:130,flex:1},
    {field:'product',headerName:'Product',minWidth:160,flex:1,valueGetter:({data})=>data.product==='Cibil'&&data.cibilType?`${data.product} · ${data.cibilType}`:data.product},
    {field:'referredBy',headerName:'Referred by',minWidth:140,flex:1},
    {headerName:'Actions',colId:'actions',width:106,pinned:'right',sortable:false,filter:false,resizable:false,cellRenderer:({data})=><div className="grid-row-actions">{archived?<button className="row-icon" aria-label={`Restore ${data.name}`} title="Restore customer" onClick={()=>actions.current.onRestore(data)}><RotateCcw size={17}/></button>:<><Link className="row-icon" aria-label={`Edit ${data.name}`} title="Edit customer" to={`/app/customers/${data.id}/edit`}><Edit3 size={17}/></Link><button className="row-icon" aria-label={`Archive ${data.name}`} title="Archive customer" onClick={()=>actions.current.onArchive(data)}><Archive size={17}/></button></>}</div>}
  ],[archived])
  return <div className="ag-customer-grid"><AgGridReact ref={ref} theme={theme} rowData={rows} columnDefs={columns} defaultColDef={defaultColumns} getRowId={getRowId} rowSelection={selectionOptions} selectionColumnDef={{pinned:'left',width:48}} pagination paginationPageSize={20} paginationPageSizeSelector={[20,50,100]} onFirstDataRendered={e=>sync(e.api)} onSelectionChanged={e=>{if(syncing.current)return;const ids=new Set(e.api.getSelectedRows().map(c=>c.id));if(ids.size!==selected.size||[...ids].some(id=>!selected.has(id)))onSelection(ids)}}/></div>
}

export function ImportPreviewGrid({rows}){
  const columns=useMemo(()=>[{field:'name',headerName:'Name',minWidth:170,flex:1},{field:'phone',headerName:'Phone',minWidth:150,flex:1},{field:'product',headerName:'Product',minWidth:170,flex:1},{field:'dob',headerName:'DOB',minWidth:130,flex:1}],[])
  return <div className="ag-import-grid"><AgGridReact theme={theme} rowData={rows} columnDefs={columns} defaultColDef={defaultColumns} pagination paginationPageSize={20} paginationPageSizeSelector={[20,50,100]}/></div>
}
